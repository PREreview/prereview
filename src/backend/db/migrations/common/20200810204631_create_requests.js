import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return Promise.all([
    knex.schema
      .createTable('comments', table => {
        table
          .increments('id')
          .primary()
          .unsigned();
        table.text('content').notNullable();
        table.timestamps(true, true);
      })
      .then(() =>
        knex.raw(
          onUpdateTrigger(knex.context.client.config.client, 'comments'),
        ),
      ),
    knex.schema.createTable('user_comments', table => {
      table.integer('cid').index();
      table
        .foreign('cid')
        .references('id')
        .inTable('comments');
      table.integer('uid').index();
      table
        .foreign('uid')
        .references('id')
        .inTable('users');
    }),
    knex.schema.createTable('preprint_comments', table => {
      table.integer('pid').index();
      table
        .foreign('pid')
        .references('id')
        .inTable('preprintss');
      table.integer('cid').index();
      table
        .foreign('cid')
        .references('id')
        .inTable('comments');
    }),
  ]);
}

export function down(knex) {
  return Promise.all([
    knex.schema.dropTable('preprint_comments'),
    knex.schema.dropTable('user_comments'),
    knex.schema.dropTable('comments'),
  ]);
}
