import { Migration } from '@mikro-orm/migrations';

export class Migration20210506132046 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table `event` add column `url` text null;');
  }
}
