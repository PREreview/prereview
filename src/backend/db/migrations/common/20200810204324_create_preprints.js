import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return Promise.all([
    knex.schema
      .createTable('preprints', table => {
        table
          .increments('id')
          .primary()
          .unsigned();
        table.text('title');
        table.text('abstract');
        table.string('source');
        table.string('publisher');
        table.json('license');
        table.integer('n_prereviews').index();
        table.timestamp('date_indexed');
        table.timestamps(true, true);
      })
      .then(() =>
        knex.raw(
          onUpdateTrigger(knex.context.client.config.client, 'preprints'),
        ),
      ),
    knex.schema.createTable('user_preprints', table => {
      table.integer('pid').index();
      table
        .foreign('pid')
        .references('id')
        .inTable('preprints');
      table.integer('uid').index();
      table
        .foreign('uid')
        .references('id')
        .inTable('users');
    }),
  ]);
}

export function down(knex) {
  return Promise.all([
    knex.schema.dropTable('user_preprints'),
    knex.schema.dropTable('preprints'),
  ]);
}
