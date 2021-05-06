import { Migration } from '@mikro-orm/migrations';

export class Migration20210506144030 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "event" add column "url" text null;');
  }
}
