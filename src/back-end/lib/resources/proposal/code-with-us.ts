import * as crud from 'back-end/lib/crud';
import * as db from 'back-end/lib/db';
import * as permissions from 'back-end/lib/permissions';
import { basicResponse, JsonResponseBody, makeJsonResponseBody, nullRequestBodyHandler, wrapRespond } from 'back-end/lib/server';
import { SupportedRequestBodies, SupportedResponseBodies } from 'back-end/lib/types';
import { validateAttachments, validateCWUOpportunityId, validateCWUProposalId, validateProponent } from 'back-end/lib/validation';
import { get, omit } from 'lodash';
import { getNumber, getString, getStringArray } from 'shared/lib';
import { FileRecord } from 'shared/lib/resources/file';
import { CreateProponentRequestBody, CreateRequestBody, CreateValidationErrors, CWUProposal, CWUProposalSlim, CWUProposalStatus, DeleteValidationErrors, isValidStatusChange, UpdateRequestBody, UpdateValidationErrors } from 'shared/lib/resources/proposal/code-with-us';
import { AuthenticatedSession, Session } from 'shared/lib/resources/session';
import { adt, ADT, Id } from 'shared/lib/types';
import { allValid, getInvalidValue, invalid, isInvalid, valid, Validation } from 'shared/lib/validation';
import * as proposalValidation from 'shared/lib/validation/proposal/code-with-us';

interface ValidatedCreateRequestBody {
  session: AuthenticatedSession;
  opportunity: Id;
  proposalText: string;
  additionalComments: string;
  proponent: CreateProponentRequestBody;
  attachments: Id[];
}

interface ValidatedUpdateEditRequestBody {
  proposalText: string;
  additionalComments: string;
  proponent: CreateProponentRequestBody;
  attachments: FileRecord[];
}

interface ValidatedUpdateRequestBody {
  session: AuthenticatedSession;
  body: ADT<'edit', ValidatedUpdateEditRequestBody>
      | ADT<'submit', string>
      | ADT<'score', { note: string, score: number }>
      | ADT<'award', string>
      | ADT<'disqualify', string>
      | ADT<'withdraw', string>;
}

type ValidatedDeleteRequestBody = Id;

type Resource = crud.Resource<
  SupportedRequestBodies,
  SupportedResponseBodies,
  CreateRequestBody,
  ValidatedCreateRequestBody,
  CreateValidationErrors,
  null,
  null,
  UpdateRequestBody | null,
  ValidatedUpdateRequestBody,
  UpdateValidationErrors,
  ValidatedDeleteRequestBody,
  DeleteValidationErrors,
  Session,
  db.Connection
>;

const resource: Resource = {
  routeNamespace: 'code-with-us/proposal',

  readMany(connection) {
    return nullRequestBodyHandler<JsonResponseBody<CWUProposalSlim[] | string[]>, Session>(async request => {
      const respond = (code: number, body: CWUProposalSlim[] | string[]) => basicResponse(code, request.session, makeJsonResponseBody(body));
      const validatedCWUOpportunity = await validateCWUOpportunityId(connection, request.query.opportunity, request.session);
      if (isInvalid(validatedCWUOpportunity)) {
       return respond(404, ['Code With Us opportunity not found.']);
      }

      if (!await permissions.readManyCWUProposals(connection, request.session, request.query.opportunity)) {
        return respond(401, [permissions.ERROR_MESSAGE]);
      }
      const dbResult = await db.readManyCWUProposals(connection, request.query.opportunity);
      if (isInvalid(dbResult)) {
        return respond(503, [db.ERROR_MESSAGE]);
      }
      return respond(200, dbResult.value);
    });
  },

  readOne(connection) {
    return nullRequestBodyHandler<JsonResponseBody<CWUProposal | string[]>, Session>(async request => {
      const respond = (code: number, body: CWUProposal | string[]) => basicResponse(code, request.session, makeJsonResponseBody(body));
      const validatedCWUOpportunity = await validateCWUOpportunityId(connection, request.query.opportunity, request.session);
      if (isInvalid(validatedCWUOpportunity)) {
        return respond(404, ['Code With Us opportunity not found.']);
      }

      const validatedCWUProposal = await validateCWUProposalId(connection, request.params.id, request.session);
      if (isInvalid(validatedCWUProposal)) {
        return respond(404, ['Proposal not found.']);
      }

      if (!await permissions.readOneCWUProposal(connection, request.session, request.query.opportunity, request.params.id)) {
        return respond(401, [permissions.ERROR_MESSAGE]);
      }
      const dbResult = await db.readOneCWUProposal(connection, request.params.id, request.session);
      if (isInvalid(dbResult) || !dbResult.value) {
        return respond(503, [db.ERROR_MESSAGE]);
      }
      return respond(200, dbResult.value);
    });
  },

  create(connection) {
    return {
      async parseRequestBody(request) {
        const body: unknown = request.body.tag === 'json' ? request.body.value : {};
        return {
          opportunity: getString(body, 'opportunity'),
          proposalText: getString(body, 'proposalText'),
          additionalComments: getString(body, 'additionalComments'),
          proponent: get(body, 'proponent'),
          attachments: getStringArray(body, 'attachments')
        };
      },
      async validateRequestBody(request) {
        const { opportunity,
                proposalText,
                additionalComments,
                proponent,
                attachments } = request.body;

        if (!permissions.createCWUProposal(request.session)) {
          return invalid({
            permissions: [permissions.ERROR_MESSAGE]
          });
        }

        const validatedCWUOpportunity = await validateCWUOpportunityId(connection, opportunity, request.session);
        if (isInvalid(validatedCWUOpportunity)) {
          return invalid({
            notFound: ['The specified opportunity does not exist.']
          });
        }

        // Check for existing proposal on this opportunity, authored by this user
        const dbResult = await db.readOneProposalByOpportunityAndAuthor(connection, opportunity, request.session);
        if (isInvalid(dbResult)) {
          return invalid({
            database: [db.ERROR_MESSAGE]
          });
        }
        if (dbResult.value) {
          return invalid({
            conflict: ['You already have a proposal for this opportunity.']
          });
        }

        const validatedProposalText = proposalValidation.validateProposalText(proposalText);
        const validatedAdditionalComments = proposalValidation.validateAdditionalComments(additionalComments);
        const validatedProponent = await validateProponent(connection, proponent);
        const validatedAttachments = await validateAttachments(connection, attachments);

        if (allValid([validatedProposalText, validatedAdditionalComments, validatedProponent, validatedAttachments])) {
          return valid({
            session: request.session,
            opportunity: validatedCWUOpportunity.value.id,
            proposalText: validatedProposalText.value,
            additionalComments: validatedAdditionalComments.value,
            proponent: validatedProponent.value,
            attachments: validatedAttachments.value
          });
        } else {
          return invalid({
            opportunity: getInvalidValue(validatedCWUOpportunity, undefined),
            proposalText: getInvalidValue(validatedProposalText, undefined),
            additionalComments: getInvalidValue(validatedAdditionalComments, undefined),
            proponent: getInvalidValue(validatedProponent, undefined),
            attachments: getInvalidValue(validatedAttachments, undefined)
          });
        }
      },
      respond: wrapRespond<ValidatedCreateRequestBody, CreateValidationErrors, JsonResponseBody<CWUProposal>, JsonResponseBody<CreateValidationErrors>, Session>({
        valid: (async request => {
          const dbResult = await db.createCWUProposal(connection, omit(request.body, 'session'), request.body.session);
          if (isInvalid(dbResult)) {
            return basicResponse(503, request.session, makeJsonResponseBody({ database: [db.ERROR_MESSAGE] }));
          }
          return basicResponse(201, request.session, makeJsonResponseBody(dbResult.value));
        }),
        invalid: (async request => {
          return basicResponse(400, request.session, makeJsonResponseBody(request.body));
        })
      })
    };
  },

  update(connection) {
    return {
      async parseRequestBody(request) {
        const body = request.body.tag === 'json' ? request.body.value : {};
        const tag = get(body, 'tag');
        const value: unknown = get(body, 'value');
        switch (tag) {
          case 'edit':
            return adt('edit', {
              proposalText: getString(value, 'proposalText'),
              additionalComments: getString(value, 'additionalComments'),
              proponent: get(value, 'proponent'),
              attachments: getStringArray(value, 'attachments')
            });
          case 'submit':
            return adt('submit', String(value));
          case 'score':
            return adt('score', {
              score: getNumber<number>(value, 'score', -1),
              note: getString(value, 'note')
            });
          case 'award':
            return adt('award', String(value));
          case 'disqualify':
            return adt('disqualify', String(value));
          case 'withdraw':
            return adt('withdraw', String(value));
          default:
            return null;
        }
      },
      async validateRequestBody(request) {
        if (!request.body) { return invalid({ proposal: adt('parseFailure' as const) }); }
        const validatedCWUProposal = await validateCWUProposalId(connection, request.params.id, request.session);
        if (isInvalid(validatedCWUProposal)) {
          return invalid({ notFound: ['The specified proposal does not exist.'] });
        }

        if (!permissions.editCWUProposal(connection, request.session, request.params.id)) {
          return invalid({
            permissions: [permissions.ERROR_MESSAGE]
          });
        }

        switch (request.body.tag) {
          case 'edit':
            const { proposalText,
                    additionalComments,
                    proponent,
                    attachments } = request.body.value;

            const validatedProposalText = proposalValidation.validateProposalText(proposalText);
            const validatedAdditionalComments = proposalValidation.validateAdditionalComments(additionalComments);
            const validatedProponent = await validateProponent(connection, proponent);
            const validatedAttachments = await validateAttachments(connection, attachments);

            if (allValid([validatedProposalText, validatedAdditionalComments, validatedProponent, validatedAttachments])) {
              return valid({
                session: request.session,
                body: adt('edit', {
                  proposalText: validatedProposalText.value,
                  additionalComments: validatedAdditionalComments.value,
                  proponent: validatedProponent.value,
                  attachments: validatedAttachments.value
                })
              });
            } else {
              return invalid(adt('edit', {
                proposalText: getInvalidValue(validatedProposalText, undefined),
                additionalComments: getInvalidValue(validatedAdditionalComments, undefined),
                proponent: getInvalidValue(validatedProponent, undefined),
                attachments: getInvalidValue(validatedAttachments, undefined)
              }));
            }
          case 'submit':
            if (!isValidStatusChange(validatedCWUProposal.value.status, CWUProposalStatus.Submitted)) {
              return invalid({ permissions: [permissions.ERROR_MESSAGE] });
            }
            const validatedSubmissionNote = proposalValidation.validateNote(request.body.value);
            if (isInvalid(validatedSubmissionNote)) {
              return invalid({ proposal: adt('submit' as const, validatedSubmissionNote.value) });
            }
            return valid({
              session: request.session,
              body: adt('submit', validatedSubmissionNote.value)
            });
          case 'score':
            if (!isValidStatusChange(validatedCWUProposal.value.status, CWUProposalStatus.Review)) {
              return invalid({ permissions: [permissions.ERROR_MESSAGE] });
            }
            const validatedScore = proposalValidation.validateScore(request.body.value.score);
            const validatedScoringNote = proposalValidation.validateNote(request.body.value.note);
            if (isInvalid(validatedScoringNote) || isInvalid(validatedScore)) {
              return invalid({ proposal: adt('score' as const, { score: getInvalidValue(validatedScore, undefined), note: getInvalidValue(validatedScoringNote, undefined) }) });
            }
            return valid({
              session: request.session,
              body: adt('score', { score: validatedScore.value, note: validatedScoringNote.value })
            });
          case 'award':
            if (!isValidStatusChange(validatedCWUProposal.value.status, CWUProposalStatus.Awarded)) {
              return invalid({ permissions: [permissions.ERROR_MESSAGE] });
            }
            const validatedAwardNote = proposalValidation.validateNote(request.body.value);
            if (isInvalid(validatedAwardNote)) {
              return invalid({ proposal: adt('award' as const, validatedAwardNote.value) });
            }
            return valid({
              session: request.session,
              body: adt('award', validatedAwardNote.value)
            });
          case 'disqualify':
            if (!isValidStatusChange(validatedCWUProposal.value.status, CWUProposalStatus.Disqualified)) {
              return invalid({
                permissions: [permissions.ERROR_MESSAGE]
              });
            }
            const validatedDisqualifyNote = proposalValidation.validateNote(request.body.value);
            if (isInvalid(validatedDisqualifyNote)) {
              return invalid({ proposal: adt('disqualify' as const, validatedDisqualifyNote.value) });
            }
            return valid({
              session: request.session,
              body: adt('disqualify', validatedDisqualifyNote.value)
            });
          case 'withdraw':
            if (!isValidStatusChange(validatedCWUProposal.value.status, CWUProposalStatus.Withdrawn)) {
              return invalid({
                permissions: [permissions.ERROR_MESSAGE]
              });
            }
            const validatedWithdrawalNote = proposalValidation.validateNote(request.body.value);
            if (isInvalid(validatedWithdrawalNote)) {
              return invalid({ proposal: adt('withdraw' as const, validatedWithdrawalNote.value) });
            }
            return valid({
              session: request.session,
              body: adt('withdraw', validatedWithdrawalNote.value)
            });
          default:
            return invalid({ proposal: adt('parseFailure' as const) });
        }
      },
      respond: wrapRespond<ValidatedUpdateRequestBody, UpdateValidationErrors, JsonResponseBody<CWUProposal>, JsonResponseBody<UpdateValidationErrors>, Session>({
        valid: (async request => {
          let dbResult: Validation<CWUProposal, null>;
          const { session, body } = request.body;
          switch (body.tag) {
            case 'edit':
              dbResult = await db.updateCWUProposal(connection, { ...body.value, id: request.params.id }, session);
              break;
            case 'submit':
              dbResult = await db.updateCWUProposalStatus(connection, request.params.id, CWUProposalStatus.Submitted, body.value, session);
              break;
            case 'score':
              dbResult = await db.updateCWUProposalScore(connection, request.params.id, body.value.score, body.value.note, session);
              break;
            case 'award':
              dbResult = await db.awardCWUProposal(connection, request.params.id, body.value, session);
              break;
            case 'disqualify':
              dbResult = await db.updateCWUProposalStatus(connection, request.params.id, CWUProposalStatus.Disqualified, body.value, session);
              break;
            case 'withdraw':
              dbResult = await db.updateCWUProposalStatus(connection, request.params.id, CWUProposalStatus.Withdrawn, body.value, session);
              break;
          }
          if (isInvalid(dbResult)) {
            return basicResponse(503, request.session, makeJsonResponseBody({ database: [db.ERROR_MESSAGE] }));
          }
          return basicResponse(200, request.session, makeJsonResponseBody(dbResult.value));
        }),
        invalid: (async request => {
          return basicResponse(400, request.session, makeJsonResponseBody(request.body));
        })
      })
    };
  },

  delete(connection) {
    return {
      async validateRequestBody(request) {
        if (!(await permissions.deleteCWUProposal(connection, request.session, request.params.id))) {
          return invalid({
            permissions: [permissions.ERROR_MESSAGE]
          });
        }
        const validatedCWUProposal = await validateCWUProposalId(connection, request.params.id, request.session);
        if (isInvalid(validatedCWUProposal)) {
          return invalid({ notFound: ['Proposal not found.'] });
        }
        if (validatedCWUProposal.value.status !== CWUProposalStatus.Draft) {
          return invalid({ permissions: [permissions.ERROR_MESSAGE] });
        }
        return valid(validatedCWUProposal.value.id);
      },
      respond: wrapRespond({
        valid: async request => {
          const dbResult = await db.deleteCWUProposal(connection, request.body, request.session);
          if (isInvalid(dbResult)) {
            return basicResponse(503, request.session, makeJsonResponseBody({ database: [db.ERROR_MESSAGE] }));
          }
          return basicResponse(200, request.session, makeJsonResponseBody(dbResult.value));
        },
        invalid: async request => {
          return basicResponse(400, request.session, makeJsonResponseBody(request.body));
        }
      })
    };
  }
};

export default resource;