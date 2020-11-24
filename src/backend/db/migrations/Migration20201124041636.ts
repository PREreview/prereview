import { Migration } from '@mikro-orm/migrations';

export class Migration20201124041636 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `user` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar null, `email` varchar null, `orcid` varchar not null);');
    this.addSql('create unique index `user_email_unique` on `user` (`email`);');

    this.addSql('create table `tag` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar not null, `color` varchar not null);');
    this.addSql('create unique index `tag_name_unique` on `tag` (`name`);');

    this.addSql('create table `preprint` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `title` varchar not null, `uuid` varchar null, `doi` varchar null, `arxivid` varchar null, `preprint_server` varchar null, `encoding_format` varchar null, `date_posted` datetime null, `url` varchar not null, `pdf_url` varchar not null);');
    this.addSql('create unique index `preprint_doi_unique` on `preprint` (`doi`);');

    this.addSql('create table `tag_preprints` (`tag_id` integer not null, `preprint_id` integer not null, primary key (`tag_id`, `preprint_id`));');
    this.addSql('create index `tag_preprints_tag_id_index` on `tag_preprints` (`tag_id`);');
    this.addSql('create index `tag_preprints_preprint_id_index` on `tag_preprints` (`preprint_id`);');

    this.addSql('create table `persona` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar not null, `avatar` blob null);');
    this.addSql('create unique index `persona_name_unique` on `persona` (`name`);');

    this.addSql('create table `rapid_review` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `contents` json not null);');

    this.addSql('create table `request` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null);');

    this.addSql('create table `group` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar not null);');
    this.addSql('create unique index `group_name_unique` on `group` (`name`);');

    this.addSql('create table `group_members` (`group_id` integer not null, `user_id` integer not null, primary key (`group_id`, `user_id`));');
    this.addSql('create index `group_members_group_id_index` on `group_members` (`group_id`);');
    this.addSql('create index `group_members_user_id_index` on `group_members` (`user_id`);');

    this.addSql('create table `full_review` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `published` integer not null, `doi` varchar null);');
    this.addSql('create unique index `full_review_doi_unique` on `full_review` (`doi`);');

    this.addSql('create table `full_review_draft` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `title` varchar not null, `contents` varchar not null);');

    this.addSql('create table `full_review_authors` (`full_review_id` integer not null, `persona_id` integer not null, primary key (`full_review_id`, `persona_id`));');
    this.addSql('create index `full_review_authors_full_review_id_index` on `full_review_authors` (`full_review_id`);');
    this.addSql('create index `full_review_authors_persona_id_index` on `full_review_authors` (`persona_id`);');

    this.addSql('create table `community` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar not null, `description` varchar not null, `logo` blob not null);');
    this.addSql('create unique index `community_name_unique` on `community` (`name`);');

    this.addSql('create table `community_members` (`community_id` integer not null, `user_id` integer not null, primary key (`community_id`, `user_id`));');
    this.addSql('create index `community_members_community_id_index` on `community_members` (`community_id`);');
    this.addSql('create index `community_members_user_id_index` on `community_members` (`user_id`);');

    this.addSql('create table `community_preprints` (`community_id` integer not null, `preprint_id` integer not null, primary key (`community_id`, `preprint_id`));');
    this.addSql('create index `community_preprints_community_id_index` on `community_preprints` (`community_id`);');
    this.addSql('create index `community_preprints_preprint_id_index` on `community_preprints` (`preprint_id`);');

    this.addSql('create table `comment` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `contents` varchar not null);');

    this.addSql('alter table `persona` add column `identity_id` integer null;');
    this.addSql('create index `persona_identity_id_index` on `persona` (`identity_id`);');

    this.addSql('alter table `rapid_review` add column `author_id` integer null;');
    this.addSql('alter table `rapid_review` add column `preprint_id` integer null;');
    this.addSql('create index `rapid_review_author_id_index` on `rapid_review` (`author_id`);');
    this.addSql('create index `rapid_review_preprint_id_index` on `rapid_review` (`preprint_id`);');

    this.addSql('alter table `request` add column `author_id` integer null;');
    this.addSql('alter table `request` add column `preprint_id` integer null;');
    this.addSql('create index `request_author_id_index` on `request` (`author_id`);');
    this.addSql('create index `request_preprint_id_index` on `request` (`preprint_id`);');

    this.addSql('alter table `full_review` add column `preprint_id` integer null;');
    this.addSql('create index `full_review_preprint_id_index` on `full_review` (`preprint_id`);');

    this.addSql('alter table `full_review_draft` add column `parent_id` integer null;');
    this.addSql('create index `full_review_draft_parent_id_index` on `full_review_draft` (`parent_id`);');

    this.addSql('alter table `comment` add column `author_id` integer null;');
    this.addSql('alter table `comment` add column `parent_id` integer null;');
    this.addSql('create index `comment_author_id_index` on `comment` (`author_id`);');
    this.addSql('create index `comment_parent_id_index` on `comment` (`parent_id`);');
  }

}
