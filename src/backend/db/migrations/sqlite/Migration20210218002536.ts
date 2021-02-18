import { Migration } from '@mikro-orm/migrations';

export class Migration20210218002536 extends Migration {
  async up(): Promise<void> {
    this.addSql('drop index `persona_name_unique`;');
  }
}
