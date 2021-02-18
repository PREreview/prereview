import { Migration } from '@mikro-orm/migrations';

export class Migration20210218002037 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "persona" drop constraint "persona_name_unique";');
  }
}
