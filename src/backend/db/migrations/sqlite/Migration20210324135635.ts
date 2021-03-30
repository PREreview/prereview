import { Migration } from '@mikro-orm/migrations';

export class Migration20210324135635 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table `expertise` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar not null);',
    );
    this.addSql(
      'create unique index `expertise_uuid_unique` on `expertise` (`uuid`);',
    );
    this.addSql(
      'create unique index `expertise_name_unique` on `expertise` (`name`);',
    );

    this.addSql(
      'create table `expertise_personas` (`expertise_id` integer not null, `persona_id` integer not null, primary key (`expertise_id`, `persona_id`));',
    );
    this.addSql(
      'create index `expertise_personas_expertise_id_index` on `expertise_personas` (`expertise_id`);',
    );
    this.addSql(
      'create index `expertise_personas_persona_id_index` on `expertise_personas` (`persona_id`);',
    );
  }
}
