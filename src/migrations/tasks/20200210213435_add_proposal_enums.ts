import { makeDomainLogger } from 'back-end/lib/logger';
import { console as consoleAdapter } from 'back-end/lib/logger/adapters';
import Knex from 'knex';

const nodeEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const logger = makeDomainLogger(consoleAdapter, 'migrations', nodeEnv);

enum CWUProposalStatus {
  Draft = 'DRAFT',
  Submitted = 'SUBMITTED',
  UnderReview = 'UNDER_REVIEW',
  Evaluated = 'EVALUATED',
  Awarded = 'AWARDED',
  NotAwarded = 'NOT_AWARDED',
  Disqualified = 'DISQUALIFIED',
  Withdrawn = 'WITHDRAWN'
}

enum PreviousCWUProposalStatus {
  Draft = 'DRAFT',
  Submitted = 'SUBMITTED',
  Review = 'REVIEW',
  Awarded = 'AWARDED',
  NotAwarded = 'NOT_AWARDED',
  Disqualified = 'DISQUALIFIED',
  Withdrawn = 'WITHDRAWN'
}

export async function up(connection: Knex): Promise<void> {
  await connection.schema.raw(' \
    ALTER TABLE "cwuProposalStatuses" \
    DROP CONSTRAINT "cwuProposalStatuses_status_check" \
  ');

  await connection('cwuOpportunityStatuses')
    .where({ status: 'REVIEW' })
    .update({ status: 'UNDER_REVIEW' });

  await connection.schema.raw(` \
    ALTER TABLE "cwuProposalStatuses" \
    ADD CONSTRAINT "cwuProposalStatuses_status_check" \
    CHECK (status IN ('${Object.values(CWUProposalStatus).join('\',\'')}')) \
  `);

  logger.info('Modified constraint on cwuProposalStatuses');
}

// tslint:disable-next-line: no-empty
export async function down(connection: Knex): Promise<void> {
  await connection.schema.raw(' \
    ALTER TABLE "cwuProposalStatuses" \
    DROP CONSTRAINT "cwuProposalStatuses_status_check" \
  ');

  await connection('cwuOpportunityStatuses')
    .where({ status: 'UNDER_REVIEW' })
    .update({ status: 'REVIEW' });

  await connection.schema.raw(` \
    ALTER TABLE "cwuProposalStatuses" \
    ADD CONSTRAINT "cwuProposalStatuses_status_check" \
    CHECK (status IN ('${Object.values(PreviousCWUProposalStatus).join('\',\'')}')) \
  `);

  logger.info('Reverted constraint on cwuProposalStatuses');
}
