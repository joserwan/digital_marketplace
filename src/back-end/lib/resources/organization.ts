import * as crud from 'back-end/lib/crud';
import { Connection, createAffiliation, createOrganization, isUserOwnerOfOrg, readManyOrganizations, readOneOrganization, updateOrganization } from 'back-end/lib/db';
import * as permissions from 'back-end/lib/permissions';
import { basicResponse, JsonResponseBody, makeJsonResponseBody, nullRequestBodyHandler } from 'back-end/lib/server';
import { SupportedRequestBodies, SupportedResponseBodies } from 'back-end/lib/types';
import { validateImageFile, validateOrganizationId } from 'back-end/lib/validation';
import { getString } from 'shared/lib';
import { MembershipType } from 'shared/lib/resources/affiliation';
import { PublicFile } from 'shared/lib/resources/file';
import { CreateRequestBody, CreateValidationErrors, Organization, OrganizationSlim, UpdateRequestBody, UpdateValidationErrors } from 'shared/lib/resources/organization';
import { Session } from 'shared/lib/resources/session';
import { allValid, getInvalidValue, invalid, valid, validateGenericString } from 'shared/lib/validation';
import { validatePhone, validateUrl } from 'shared/lib/validation/organization';
import { validateEmail } from 'shared/lib/validation/user';

export interface ValidatedUpdateRequestBody extends Omit<UpdateRequestBody, 'logoImageFile'> {
  logoImageFile?: PublicFile;
  active?: boolean;
}

export interface ValidatedCreateRequestBody extends Omit<CreateRequestBody, 'logoImageFile'> {
  logoImageFile?: PublicFile;
}

type DeleteValidatedReqBody = Organization;

type DeleteReqBodyErrors = string[];

type Resource = crud.Resource<
  SupportedRequestBodies,
  SupportedResponseBodies,
  CreateRequestBody,
  ValidatedCreateRequestBody,
  CreateValidationErrors,
  null,
  null,
  UpdateRequestBody,
  ValidatedUpdateRequestBody,
  UpdateValidationErrors,
  DeleteValidatedReqBody,
  DeleteReqBodyErrors,
  Session,
  Connection
>;

const resource: Resource = {
  routeNamespace: 'organizations',

  readMany(connection) {
    return nullRequestBodyHandler<JsonResponseBody<OrganizationSlim[]>, Session>(async request => {
      const respond = (code: number, body: OrganizationSlim[]) => basicResponse(code, request.session, makeJsonResponseBody(body));
      // Pass session in so we can add owner name for admin/owner only
      const organizations = await readManyOrganizations(connection, request.session);
      return respond(200, organizations);
    });
  },

  readOne(connection) {
    return nullRequestBodyHandler<JsonResponseBody<Organization | string[]>, Session>(async request => {
      const respond = (code: number, body: Organization | string[]) => basicResponse(code, request.session, makeJsonResponseBody(body));
      // Only admins or the org owner can read the full org details
      if (permissions.readOneOrganization(request.session) ||
          (request.session.user && await isUserOwnerOfOrg(connection, request.session.user!.id, request.params.id))) {
            const organization = await readOneOrganization(connection, request.params.id);
            return respond(200, organization);
      }
      return respond(401, [permissions.ERROR_MESSAGE]);
    });
  },

  create(connection) {
    return {
      parseRequestBody(request) {
        return request.body.tag === 'json' ? request.body.value : {};
      },
      async validateRequestBody(request) {
        const { legalName,
                logoImageFile,
                websiteUrl,
                streetAddress1,
                streetAddress2,
                city,
                region,
                mailCode,
                country,
                contactName,
                contactTitle,
                contactEmail,
                contactPhone } = request.body;

        const validatedLegalName = legalName ? validateGenericString(legalName, 'Legal Name') : invalid(['Legal name is required']);
        const validatedLogoImageFile = logoImageFile ? await validateImageFile(connection, logoImageFile) : valid(undefined);
        const validatedWebsiteUrl = websiteUrl ? validateUrl(websiteUrl) : valid(undefined);
        const validatedStreetAddress1 = streetAddress1 ? validateGenericString(streetAddress1, 'Street Address') : invalid(['Street Address is required']);
        const validatedStreetAddress2 = streetAddress2 ? validateGenericString(streetAddress2, 'Street Address') : valid(undefined);
        const validatedCity = city ? validateGenericString(city, 'City') : invalid(['City is required']);
        const validatedRegion = region ? validateGenericString(region, 'Province/State') : invalid(['Region is required']);
        const validatedMailCode = mailCode ? validateGenericString(mailCode, 'Postal / Zip Code') : invalid(['Zip/Postal Code is required']);
        const validatedCountry = country ? validateGenericString(country, 'Country') : invalid(['Country is required']);
        const validatedContactName = contactName ? validateGenericString(contactName, 'Contact Name') : invalid(['Contact name is required']);
        const validatedContactTitle = contactTitle ? validateGenericString(contactTitle, 'Contact Title') : valid(undefined);
        const validatedContactEmail = contactEmail ? validateEmail(contactEmail) : invalid(['Contact email is required']);
        const validatedContactPhone = contactPhone ? validatePhone(contactPhone) : valid(undefined);

        if (allValid([validatedLegalName,
                      validatedLogoImageFile,
                      validatedWebsiteUrl,
                      validatedStreetAddress1,
                      validatedStreetAddress2,
                      validatedCity,
                      validatedRegion,
                      validatedMailCode,
                      validatedCountry,
                      validatedContactName,
                      validatedContactTitle,
                      validatedContactEmail,
                      validatedContactPhone
                    ])) {
                      return valid({
                        legalName: validatedLegalName.value,
                        logoImageFile: validatedLogoImageFile.value,
                        websiteUrl: validatedWebsiteUrl.value,
                        streetAddress1: validatedStreetAddress1.value,
                        streetAddress2: validatedStreetAddress2.value,
                        city: validatedCity.value,
                        region: validatedRegion.value,
                        mailCode: validatedMailCode.value,
                        country: validatedCountry.value,
                        contactName: validatedContactName.value,
                        contactTitle: validatedContactTitle.value,
                        contactEmail: validatedContactEmail.value,
                        contactPhone: validatedContactPhone.value
                      });
                    } else {
                      return invalid({
                        legalName: getInvalidValue(validatedLegalName, undefined),
                        logoImageFile: getInvalidValue(validatedLogoImageFile, undefined),
                        websiteUrl: getInvalidValue(validatedWebsiteUrl, undefined),
                        contactName: getInvalidValue(validatedContactName, undefined),
                        contactTitle: getInvalidValue(validatedContactTitle, undefined),
                        contactEmail: getInvalidValue(validatedContactEmail, undefined),
                        contactPhone: getInvalidValue(validatedContactPhone, undefined),
                        streetAddress1: getInvalidValue(validatedStreetAddress1, undefined),
                        streetAddress2: getInvalidValue(validatedStreetAddress2, undefined),
                        city: getInvalidValue(validatedCity, undefined),
                        region: getInvalidValue(validatedRegion, undefined),
                        mailCode: getInvalidValue(validatedMailCode, undefined),
                        country: getInvalidValue(validatedCountry, undefined)
                      });
                    }
      },
      async respond(request) {
        const respond = (code: number, body: Organization | string[]) => basicResponse(code, request.session, makeJsonResponseBody(body));
        if (!permissions.createOrganization(request.session)) {
          return respond(401, [permissions.ERROR_MESSAGE]);
        }
        switch (request.body.tag) {
          case 'invalid':
            return basicResponse(400, request.session, makeJsonResponseBody(request.body.value));
          case 'valid':
            // Create organization
            const organization = await createOrganization(connection, request.body.value);

            // Create affiliation for this user as owner
            await createAffiliation(connection, {
              user: request.session.user!.id,
              organization: organization.id,
              membershipType: MembershipType.Owner
            });

            return respond(200, organization);
        }
      }
    };
  },

  update(connection) {
    return {
      parseRequestBody(request) {
        const body = request.body.tag === 'json' ? request.body.value : {};
        return {
          id: request.params.id,
          legalName: getString(body, 'legalName') || undefined,
          logoImageFile: getString(body, 'logoImageFile') || undefined,
          websiteUrl: getString(body, 'websiteUrl') || undefined,
          streetAddress1: getString(body, 'streetAddress1') || undefined,
          streetAddress2: getString(body, 'streetAddress2') || undefined,
          city: getString(body, 'city') || undefined,
          region: getString(body, 'region') || undefined,
          mailCode: getString(body, 'mailCode') || undefined,
          country: getString(body, 'country') || undefined,
          contactName: getString(body, 'contactName') || undefined,
          contactTitle: getString(body, 'contactTitle') || undefined,
          contactEmail: getString(body, 'contactEmail') || undefined,
          contactPhone: getString(body, 'contactString') || undefined
        };
      },
      async validateRequestBody(request) {
        const { id,
          legalName,
          logoImageFile,
          websiteUrl,
          streetAddress1,
          streetAddress2,
          city,
          region,
          mailCode,
          country,
          contactName,
          contactTitle,
          contactEmail,
          contactPhone } = request.body;

        const validatedOrganizationId = await validateOrganizationId(connection, id);
        const validatedLegalName = legalName ? validateGenericString(legalName, 'Legal Name') : valid(undefined);
        const validatedLogoImageFile = logoImageFile ? await validateImageFile(connection, logoImageFile) : valid(undefined);
        const validatedWebsiteUrl = websiteUrl ? validateUrl(websiteUrl) : valid(undefined);
        const validatedStreetAddress1 = streetAddress1 ? validateGenericString(streetAddress1, 'Street Address') : valid(undefined);
        const validatedStreetAddress2 = streetAddress2 ? validateGenericString(streetAddress2, 'Street Address') : valid(undefined);
        const validatedCity = city ? validateGenericString(city, 'City') : valid(undefined);
        const validatedRegion = region ? validateGenericString(region, 'Province/State') : valid(undefined);
        const validatedMailCode = mailCode ? validateGenericString(mailCode, 'Postal / Zip Code') : valid(undefined);
        const validatedCountry = country ? validateGenericString(country, 'Country') : valid(undefined);
        const validatedContactName = contactName ? validateGenericString(contactName, 'Contact Name') : valid(undefined);
        const validatedContactTitle = contactTitle ? validateGenericString(contactTitle, 'Contact Title') : valid(undefined);
        const validatedContactEmail = contactEmail ? validateEmail(contactEmail) : valid(undefined);
        const validatedContactPhone = contactPhone ? validatePhone(contactPhone) : valid(undefined);

        if (allValid([validatedOrganizationId,
          validatedLegalName,
          validatedLogoImageFile,
          validatedWebsiteUrl,
          validatedStreetAddress1,
          validatedStreetAddress2,
          validatedCity,
          validatedRegion,
          validatedMailCode,
          validatedCountry,
          validatedContactName,
          validatedContactTitle,
          validatedContactEmail,
          validatedContactPhone
        ])) {
          return valid({
            id: (validatedOrganizationId.value as Organization).id,
            legalName: validatedLegalName.value,
            logoImageFile: validatedLogoImageFile.value,
            websiteUrl: validatedWebsiteUrl.value,
            streetAddress1: validatedStreetAddress1.value,
            streetAddress2: validatedStreetAddress2.value,
            city: validatedCity.value,
            region: validatedRegion.value,
            mailCode: validatedMailCode.value,
            country: validatedCountry.value,
            contactName: validatedContactName.value,
            contactTitle: validatedContactTitle.value,
            contactEmail: validatedContactEmail.value,
            contactPhone: validatedContactPhone.value
          });
        } else {
          return invalid({
            id: getInvalidValue(validatedOrganizationId, undefined),
            legalName: getInvalidValue(validatedLegalName, undefined),
            logoImageFile: getInvalidValue(validatedLogoImageFile, undefined),
            websiteUrl: getInvalidValue(validatedWebsiteUrl, undefined),
            contactName: getInvalidValue(validatedContactName, undefined),
            contactTitle: getInvalidValue(validatedContactTitle, undefined),
            contactEmail: getInvalidValue(validatedContactEmail, undefined),
            contactPhone: getInvalidValue(validatedContactPhone, undefined),
            streetAddress1: getInvalidValue(validatedStreetAddress1, undefined),
            streetAddress2: getInvalidValue(validatedStreetAddress2, undefined),
            city: getInvalidValue(validatedCity, undefined),
            region: getInvalidValue(validatedRegion, undefined),
            mailCode: getInvalidValue(validatedMailCode, undefined),
            country: getInvalidValue(validatedCountry, undefined)
          });
        }
      },
      async respond(request) {
        const respond = (code: number, body: Organization | string[]) => basicResponse(code, request.session, makeJsonResponseBody(body));
        if (!request.session.user || !await isUserOwnerOfOrg(connection, request.session.user!.id, request.params.id)) {
          return respond(401, [permissions.ERROR_MESSAGE]);
        }
        switch (request.body.tag) {
          case 'invalid':
            return basicResponse(400, request.session, makeJsonResponseBody(request.body.value));
          case 'valid':
            const updatedOrganization = await updateOrganization(connection, request.body.value);
            return respond(200, updatedOrganization);
        }
      }
    };
  },

  delete(connection) {
    return {
      async validateRequestBody(request) {
        const organization = await readOneOrganization(connection, request.params.id);
        return organization ? valid(organization) : invalid(['Organization not found']);
      },
      async respond(request) {
        const respond = (code: number, body: Organization | string[]) => basicResponse(code, request.session, makeJsonResponseBody(body));
        if (request.body.tag === 'invalid') {
          return respond(404, request.body.value);
        }
        const id = request.body.value.id;
        if (permissions.deleteOrganization(request.session) ||
            (request.session.user && await isUserOwnerOfOrg(connection, request.session.user!.id, request.params.id))) {
          // Mark the organization as inactive
          const updatedOrganization = await updateOrganization(connection, {
            id,
            active: false
          });
          return respond(200, updatedOrganization);
        }

        return respond(401, [permissions.ERROR_MESSAGE]);
      }
    };
  }
};

export default resource;