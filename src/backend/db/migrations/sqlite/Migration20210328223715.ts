import { Migration } from '@mikro-orm/migrations';

export class Migration20210328223715 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table `request` add column `is_preprint_author` integer null;',
    );
  }
}
