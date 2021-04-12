import { Migration } from '@mikro-orm/migrations';

export class Migration20210409140433 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table `event` add column `end` datetime null;');
    this.addSql('alter table `community` add column `twitter` varchar null;');
  }
}
