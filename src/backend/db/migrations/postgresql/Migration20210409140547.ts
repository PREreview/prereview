import { Migration } from '@mikro-orm/migrations';

export class Migration20210409140547 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "event" add column "end" timestamptz(0) null;');
    this.addSql(
      'alter table "community" add column "twitter" varchar(255) null;',
    );
  }
}
