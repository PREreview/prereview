import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return Promise.all([
    knex.schema
      .createTable('requests', table => {
        table
          .increments('id')
          .primary()
          .unsigned();
        table.timestamps(true, true);
      })
      .then(() =>
        knex.raw(
          onUpdateTrigger(knex.context.client.config.client, 'requests'),
        ),
      ),
    knex.schema.createTable('user_requests', table => {
      table.integer('rid').index();
      table
        .foreign('rid')
        .references('id')
        .inTable('requests');
      table.integer('uid').index();
      table
        .foreign('uid')
        .references('id')
        .inTable('users');
    }),
    knex.schema.createTable('preprint_requests', table => {
      table.integer('pid').index();
      table
        .foreign('pid')
        .references('id')
        .inTable('preprints');
      table.integer('rid').index();
      table
        .foreign('rid')
        .references('id')
        .inTable('requests');
    }),
  ]);
}

export function down(knex) {
  return Promise.all([
    knex.schema.dropTable('preprint_requests'),
    knex.schema.dropTable('user_requests'),
    knex.schema.dropTable('requests'),
  ]);
}
