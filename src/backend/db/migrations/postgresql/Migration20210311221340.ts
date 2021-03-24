import { Migration } from '@mikro-orm/migrations';

export class Migration20210311221340 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "key" ("id" serial primary key, "uuid" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "owner_id" int4 not null, "app" varchar(255) not null, "secret" varchar(255) not null);',
    );
    this.addSql(
      'alter table "key" add constraint "key_uuid_unique" unique ("uuid");',
    );

    this.addSql(
      'alter table "key" add constraint "key_owner_id_foreign" foreign key ("owner_id") references "user" ("id") on update cascade;',
    );
  }
}
