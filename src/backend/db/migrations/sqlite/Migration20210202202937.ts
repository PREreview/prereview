import { Migration } from '@mikro-orm/migrations';

export class Migration20210202202937 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `contact` rename column `send_notifications` to `is_notified`;');


    this.addSql('alter table `community` add column `slug` varchar null;');
    this.addSql('alter table `community` add column `banner` blob null;');
    this.addSql('create unique index `community_slug_unique` on `community` (`slug`);');

    this.addSql('create table `event` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `title` varchar not null, `start` datetime not null, `is_private` integer not null, `description` text null);');
    this.addSql('create unique index `event_uuid_unique` on `event` (`uuid`);');

    this.addSql('alter table `community_members` add column `persona_id` integer null;');
    this.addSql('create index `community_members_persona_id_index` on `community_members` (`persona_id`);');
    this.addSql('drop index `community_members_user_id_index`;');
    this.addSql('PRAGMA table_info(`community_members`);');

    this.addSql('create table `community_owners` (`community_id` integer not null, `user_id` integer not null, primary key (`community_id`, `user_id`));');
    this.addSql('create index `community_owners_community_id_index` on `community_owners` (`community_id`);');
    this.addSql('create index `community_owners_user_id_index` on `community_owners` (`user_id`);');

    this.addSql('create table `community_tags` (`community_id` integer not null, `tag_id` integer not null, primary key (`community_id`, `tag_id`));');
    this.addSql('create index `community_tags_community_id_index` on `community_tags` (`community_id`);');
    this.addSql('create index `community_tags_tag_id_index` on `community_tags` (`tag_id`);');

    this.addSql('alter table `event` add column `community_id` integer null;');
    this.addSql('create index `event_community_id_index` on `event` (`community_id`);');

    this.addSql('create unique index `community_slug_unique` on `community` (`slug`);');

    this.addSql('drop table if exists `full_review_author_invites`;');

    this.addSql('drop table if exists `full_review_mentor_invites`;');

    this.addSql('drop table if exists `full_review_mentors`;');

    this.addSql('drop table if exists `persona_fts`;');

    this.addSql('drop table if exists `persona_fts_config`;');

    this.addSql('drop table if exists `persona_fts_data`;');

    this.addSql('drop table if exists `persona_fts_docsize`;');

    this.addSql('drop table if exists `persona_fts_idx`;');

    this.addSql('drop table if exists `preprint_fts`;');

    this.addSql('drop table if exists `preprint_fts_config`;');

    this.addSql('drop table if exists `preprint_fts_data`;');

    this.addSql('drop table if exists `preprint_fts_docsize`;');

    this.addSql('drop table if exists `preprint_fts_idx`;');
  }

}
