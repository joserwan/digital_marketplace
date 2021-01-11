import { makeDomainLogger } from 'back-end/lib/logger';
import { console as consoleAdapter } from 'back-end/lib/logger/adapters';
import Knex from 'knex';

const logger = makeDomainLogger(consoleAdapter, 'migrations', 'development');

// tslint:disable-next-line: no-empty
export async function up(connection: Knex): Promise<void> {
  // Create the new idpId column.
  await connection.schema.table('users', table => {
    table.string('locale').defaultTo('en');
  });
  await connection('users')
    .whereNull('locale')
    .update({ locale: 'fr' });
}


export async function down(connection: Knex): Promise<void> {
  await connection.schema.alterTable('users', table => {
    table.dropColumn('locale');
  });
  logger.info('Completed reverting users table.');
}