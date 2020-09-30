import { makeDomainLogger } from 'back-end/lib/logger';
import { console as consoleAdapter } from 'back-end/lib/logger/adapters';
import Knex from 'knex';

const nodeEnv = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const logger = makeDomainLogger(consoleAdapter, 'migrations', nodeEnv);

export async function up(connection: Knex): Promise<void> {
  await connection.schema.alterTable('swuProposalTeamMembers', table => {
    table.dropColumn('pending');
  });
  logger.info('Completed modifying swuProposalTeamMembers table.');
}

export async function down(connection: Knex): Promise<void> {
  await connection.schema.alterTable('swuProposalTeamMembers', table => {
    table.boolean('pending').defaultTo(false).notNullable();
  });
  logger.info('Completed reverting swuProposalTeamMembers table.');
}
