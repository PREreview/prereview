import { Migration } from '@mikro-orm/migrations';

export class Migration20210311221222 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table `key` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `app` varchar not null, `secret` varchar not null);',
    );
    this.addSql('create unique index `key_uuid_unique` on `key` (`uuid`);');

    this.addSql('alter table `key` add column `owner_id` integer null;');
    this.addSql('create index `key_owner_id_index` on `key` (`owner_id`);');
  }
}
