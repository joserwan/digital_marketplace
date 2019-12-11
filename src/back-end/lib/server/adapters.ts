import { COOKIE_SECRET } from 'back-end/config';
import { generateUuid } from 'back-end/lib';
import { makeDomainLogger } from 'back-end/lib/logger';
import { console as consoleAdapter } from 'back-end/lib/logger/adapters';
import { ErrorResponseBody, FileResponseBody, JsonRequestBody, JsonResponseBody, makeErrorResponseBody, makeJsonRequestBody, parseSessionId, Request, Response, Route, Router, SessionIdToSession, SessionToSessionId, TextResponseBody } from 'back-end/lib/server';
import { parseServerHttpMethod, ServerHttpMethod } from 'back-end/lib/types';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import expressLib from 'express';
import { IncomingHttpHeaders } from 'http';
import { castArray } from 'lodash';
import { Validation } from 'shared/lib/validation';

const SESSION_COOKIE_NAME = 'sid';

export interface AdapterRunParams<SupportedRequestBodies, ParsedReqBody, ValidatedReqBody, ReqBodyErrors, SupportedResponseBodies, HookState, Session> {
  router: Router<SupportedRequestBodies, ParsedReqBody, ValidatedReqBody, ReqBodyErrors, SupportedResponseBodies, HookState, Session>;
  sessionIdToSession: SessionIdToSession<Session>;
  sessionToSessionId: SessionToSessionId<Session>;
  host: string;
  port: number;
}

export type Adapter<App, SupportedRequestBodies, ParsedReqBody, ValidatedReqBody, ReqBodyErrors, SupportedResponseBodies, HookState, Session> = (params: AdapterRunParams<SupportedRequestBodies, ParsedReqBody, ValidatedReqBody, ReqBodyErrors, SupportedResponseBodies, HookState, Session>) => App;

export type ExpressRequestBodies = JsonRequestBody;

export type ExpressResponseBodies = JsonResponseBody | FileResponseBody | TextResponseBody | ErrorResponseBody;

export type ExpressAdapter<ParsedReqBody, ValidatedReqBody, ReqBodyErrors, HookState, Session> = Adapter<expressLib.Application, ExpressRequestBodies, ParsedReqBody, ValidatedReqBody, ReqBodyErrors, ExpressResponseBodies, HookState, Session>;

function incomingHeaderMatches(headers: IncomingHttpHeaders, header: string, value: string): boolean {
  header = castArray(headers[header] || '').join(' ');
  return !!header.match(value);
}

export function express<ParsedReqBody, ValidatedReqBody, ReqBodyErrors, HookState, Session>(): ExpressAdapter<ParsedReqBody, ValidatedReqBody, ReqBodyErrors, HookState, Session> {
  const logger = makeDomainLogger(consoleAdapter, 'adapter:express');

  return ({ router, sessionIdToSession, sessionToSessionId, host, port }) => {
    function respond(response: Response<ExpressResponseBodies, Session>, expressRes: expressLib.Response): void {
      expressRes
        .status(response.code)
        .set(response.headers);
      // Manage the session ID cookie.
      const setSessionId = (id: string) => expressRes.cookie(SESSION_COOKIE_NAME, id, {
        signed: true,
        httpOnly: true
      });
      const sessionId = sessionToSessionId(response.session);
      setSessionId(sessionId.toString());
      // TODO make switch statement more type-safe.
      switch (response.body.tag) {
        case 'error':
        case 'json':
          expressRes.json(response.body.value);
          break;
        case 'file':
          const file = response.body.value;
          expressRes.set('Content-Type', file.contentType);
          if (file.contentEncoding) {
            expressRes.set('Content-Encoding', file.contentEncoding);
          }
          if (file.contentDisposition) {
            expressRes.set('Content-Disposition', file.contentDisposition);
          }
          expressRes.send(response.body.value.buffer);
          break;
        case 'text':
          expressRes
            .set('Content-Type', 'text/plain')
            .send(response.body.value);
          break;
      }
    }

    function makeExpressRequestHandler(route: Route<ExpressRequestBodies, ParsedReqBody, ValidatedReqBody, ReqBodyErrors, ExpressResponseBodies, HookState, Session>): expressLib.RequestHandler {
      function asyncHandler(fn: (request: expressLib.Request, expressRes: expressLib.Response, next: expressLib.NextFunction) => Promise<void>): expressLib.RequestHandler {
        return (expressReq, expressRes, next) => {
          fn(expressReq, expressRes, next)
            .catch(error => {
              const jsonError = makeErrorResponseBody(error).value;
              // Respond with a 500 if an error occurs.
              logger.error('unhandled error', jsonError);
              expressRes
                .status(500)
                .json(jsonError);
            });
        };
      }
      return asyncHandler(async (expressReq, expressRes, next) => {
        // Handle the request if it has the correct HTTP method.
        // Default to `Any` to make following logic simpler.
        const method = parseServerHttpMethod(expressReq.method) || ServerHttpMethod.Any;
        if (method !== route.method) { next(); return; }
        // Create the session.
        const sessionId = parseSessionId(expressReq.signedCookies[SESSION_COOKIE_NAME]);
        const session = await sessionIdToSession(sessionId);
        // Set up the request body.
        const headers = expressReq.headers;
        let body: ExpressRequestBodies = makeJsonRequestBody(null);
        if (method !== ServerHttpMethod.Get && incomingHeaderMatches(headers, 'content-type', 'application/json')) {
          body = makeJsonRequestBody(expressReq.body);
        }
        // Create the initial request.
        const requestId = generateUuid();
        const initialRequest: Request<ExpressRequestBodies, Session> = {
          id: requestId,
          path: expressReq.path,
          method,
          headers,
          session,
          logger: makeDomainLogger(consoleAdapter, `request:${requestId}`),
          params: expressReq.params,
          query: expressReq.query,
          body
        };
        // Run the before hook if specified.
        const hookState = route.hook ? await route.hook.before(initialRequest) : null;
        // Parse the request according to the route handler.
        const parsedRequest: Request<ParsedReqBody, Session> = {
          ...initialRequest,
          body: route.handler.parseRequestBody(initialRequest)
        };
        // Validate the request according to the route handler.
        const validatedRequest: Request<Validation<ValidatedReqBody, ReqBodyErrors>, Session> = {
          ...parsedRequest,
          body: await route.handler.validateRequestBody(parsedRequest)
        };
        // Respond to the request.
        const response = await route.handler.respond(validatedRequest);
        // Run the after hook if specified.
        // Note: we run the after hook after our business logic has completed,
        // not once the express framework sends the response.
        if (route.hook && route.hook.after) { await route.hook.after(hookState as HookState, validatedRequest, response); }
        // Respond over HTTP.
        respond(response, expressRes);
      });
    }

    // Set up the express app.
    const app = expressLib();
    // Parse JSON request bodies when provided.
    app.use(bodyParser.json({
      type: 'application/json'
    }));

    // Sign and parse cookies.
    app.use(cookieParser(COOKIE_SECRET));

    // Mount each route to the Express application.
    router.forEach(route => {
      app.all(route.path, makeExpressRequestHandler(route));
    });

    // Listen for incoming connections.
    app.listen(port, host);

    return app;
  };

}