import { Migration } from '@mikro-orm/migrations';

export class Migration20210330003233 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table `contact` add column `is_public` integer not null;',
    );
  }
}
