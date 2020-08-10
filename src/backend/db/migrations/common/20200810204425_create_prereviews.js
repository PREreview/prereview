import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return Promise.all([
    knex.schema
      .createTable('prereviews', table => {
        table
          .increments('id')
          .primary()
          .unsigned();
        table.string('doi').index();
        table.text('content').notNullable();
        table.boolean('is_hidden');
        table.timestamps(true, true);
      })
      .then(() =>
        knex.raw(
          onUpdateTrigger(knex.context.client.config.client, 'prereviews'),
        ),
      ),
    knex.schema.createTable('user_prereviews', table => {
      table.integer('pid').index();
      table
        .foreign('pid')
        .references('id')
        .inTable('prereviews');
      table.integer('uid').index();
      table
        .foreign('uid')
        .references('id')
        .inTable('users');
    }),
    knex.schema.createTable('preprint_prereviews', table => {
      table.integer('pid').index();
      table
        .foreign('pid')
        .references('id')
        .inTable('preprints');
      table.integer('rid').index();
      table
        .foreign('rid')
        .references('id')
        .inTable('prereviews');
    }),
  ]);
}

export function down(knex) {
  return Promise.all([
    knex.schema.dropTable('preprint_prereviews'),
    knex.schema.dropTable('user_prereviews'),
    knex.schema.dropTable('prereviews'),
  ]);
}
