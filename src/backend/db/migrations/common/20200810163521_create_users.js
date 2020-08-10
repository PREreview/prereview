import { onUpdateTrigger } from '../../../utils/updateTimestamp.js';

export function up(knex) {
  return knex.schema
    .createTable('users', table => {
      table
        .increments('id')
        .primary()
        .unsigned();
      table.string('name').index();
      table.string('orcid').unique();
      table.json('has_role');
      table.string('default_role');
      table.string('@type');
      table.string('@id');
      table.boolean('is_admin');
      table.boolean('is_private');
      table.boolean('coc_accepted');
      table.boolean('privacy_setup');
      table.timestamps(true, true);
    })
    .then(() =>
      knex.raw(onUpdateTrigger(knex.context.client.config.client, 'users')),
    );
}

export function down(knex) {
  return knex.schema.dropTable('users');
}
