export function parseBooleanEnvironmentVariable(raw?: string): boolean | null {
  switch (raw) {
    case '1':
    case 'true': 
      return true;
    case '0': 
    case 'false': 
      return false;
    default: return null;
  }
}
export const SHOW_TEST_INDICATOR = parseBooleanEnvironmentVariable(process.env.SHOW_TEST_INDICATOR) || false;

export const VENDOR_ACCOUNT_CREATION_DISABLED = parseBooleanEnvironmentVariable(process.env.VENDOR_ACCOUNT_CREATION_DISABLED) || false;

export const CONTACT_EMAIL = 'digitalmarketplace@gov.bc.ca';

export const GOV_IDP_SUFFIX = 'idir';

export const GOV_IDP_NAME = 'IDIR';

export const GITHUB_ENABLED = !!process.env.GITHUBID;

export const PROVINCIAL_IDP_NAME = 'ClicSEQUR Express';

export const PROVINCIAL_IDP_ENABLED = !!PROVINCIAL_IDP_NAME

export const VENDOR_IDP_SUFFIX = process.env.VENDOR_IDP_SUFFIX || PROVINCIAL_IDP_NAME || 'github';

export const VENDOR_IDP_NAME = 'GitHub';

export const TIMEZONE = 'America/Vancouver';

export const CWU_MAX_BUDGET = 70000;

export const SWU_MAX_BUDGET = 2000000;

export const COPY = {
  appTermsTitle: 'Digital Marketplace Terms & Conditions for E-Bidding',
  gov: {
    name: {
      short: 'B.C. Government',
      long: 'Government of British Columbia'
    }
  },
  region: {
    name: {
      short: 'B.C.',
      long: 'British Columbia'
    }
  }
};

export const EMPTY_STRING = '—'; // emdash

export const DEFAULT_PAGE_SIZE = 20;
