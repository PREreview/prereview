import { Migration } from '@mikro-orm/migrations';

export class Migration20210330003825 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "contact" add column "is_public" bool not null default false;',
    );
    this.addSql('alter table "contact" alter column "is_public" drop default;');
  }
}
