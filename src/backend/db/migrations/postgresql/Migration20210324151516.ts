import { Migration } from '@mikro-orm/migrations';

export class Migration20210324151516 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "expertise" ("id" serial primary key, "uuid" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" varchar(255) not null);');
    this.addSql('alter table "expertise" add constraint "expertise_uuid_unique" unique ("uuid");');
    this.addSql('alter table "expertise" add constraint "expertise_name_unique" unique ("name");');

    this.addSql('create table "expertise_personas" ("expertise_id" int4 not null, "persona_id" int4 not null);');
    this.addSql('alter table "expertise_personas" add constraint "expertise_personas_pkey" primary key ("expertise_id", "persona_id");');

    this.addSql('alter table "expertise_personas" add constraint "expertise_personas_expertise_id_foreign" foreign key ("expertise_id") references "expertise" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "expertise_personas" add constraint "expertise_personas_persona_id_foreign" foreign key ("persona_id") references "persona" ("id") on update cascade on delete cascade;');
  }

}
