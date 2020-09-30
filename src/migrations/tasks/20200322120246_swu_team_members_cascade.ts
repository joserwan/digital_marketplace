import { makeDomainLogger } from 'back-end/lib/logger';
import { console as consoleAdapter } from 'back-end/lib/logger/adapters';
import Knex from 'knex';

const nodeEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const logger = makeDomainLogger(consoleAdapter, 'migrations', nodeEnv);

export async function up(connection: Knex): Promise<void> {
  await connection.schema.raw(`
    ALTER TABLE "swuProposalTeamMembers" DROP CONSTRAINT swuproposalteammembers_phase_foreign;
    ALTER TABLE "swuProposalTeamMembers" ADD CONSTRAINT swuproposalteammembers_phase_foreign FOREIGN KEY (phase) \
      REFERENCES "swuProposalPhases"(id) ON DELETE CASCADE;
  `);
  logger.info('Modified swuProposalTeamMembers table.');
}

export async function down(connection: Knex): Promise<void> {
  await connection.schema.raw(`
    ALTER TABLE "swuProposalTeamMembers" DROP CONSTRAINT swuproposalteammembers_phase_foreign;
    ALTER TABLE "swuProposalTeamMembers" ADD CONSTRAINT swuproposalteammembers_phase_foreign FOREIGN KEY (phase) \
      REFERENCES "swuProposalPhases"(id);
  `);
  logger.info('Reverted swuProposalTeamMembers table.');
}
