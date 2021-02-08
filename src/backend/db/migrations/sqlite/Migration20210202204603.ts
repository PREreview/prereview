import { Migration } from '@mikro-orm/migrations';

export class Migration20210202204603 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table `tag` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar not null, `color` varchar not null);',
    );
    this.addSql('create unique index `tag_uuid_unique` on `tag` (`uuid`);');
    this.addSql('create unique index `tag_name_unique` on `tag` (`name`);');

    this.addSql(
      'create table `preprint` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `handle` varchar not null, `title` text not null, `authors` text null, `is_published` integer not null, `abstract_text` text null, `preprint_server` varchar null, `date_posted` datetime null, `license` varchar null, `publication` varchar null, `url` varchar null, `content_encoding` varchar null, `content_url` varchar null);',
    );
    this.addSql(
      'create unique index `preprint_uuid_unique` on `preprint` (`uuid`);',
    );
    this.addSql(
      'create unique index `preprint_handle_unique` on `preprint` (`handle`);',
    );

    this.addSql(
      'create table `tag_preprints` (`tag_id` integer not null, `preprint_id` integer not null, primary key (`tag_id`, `preprint_id`));',
    );
    this.addSql(
      'create index `tag_preprints_tag_id_index` on `tag_preprints` (`tag_id`);',
    );
    this.addSql(
      'create index `tag_preprints_preprint_id_index` on `tag_preprints` (`preprint_id`);',
    );

    this.addSql(
      'create table `persona` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar not null, `is_anonymous` integer not null, `is_locked` integer not null, `is_flagged` integer not null, `bio` text null, `avatar` blob null, `avatar_encoding` varchar null);',
    );
    this.addSql(
      'create unique index `persona_uuid_unique` on `persona` (`uuid`);',
    );
    this.addSql(
      'create unique index `persona_name_unique` on `persona` (`name`);',
    );

    this.addSql(
      "create table `rapid_review` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `is_published` integer not null, `is_flagged` integer not null, `yn_novel` text check (`yn_novel` in ('yes', 'no', 'N/A', 'unsure')) not null, `yn_future` text check (`yn_future` in ('yes', 'no', 'N/A', 'unsure')) not null, `yn_reproducibility` text check (`yn_reproducibility` in ('yes', 'no', 'N/A', 'unsure')) not null, `yn_methods` text check (`yn_methods` in ('yes', 'no', 'N/A', 'unsure')) not null, `yn_coherent` text check (`yn_coherent` in ('yes', 'no', 'N/A', 'unsure')) not null, `yn_limitations` text check (`yn_limitations` in ('yes', 'no', 'N/A', 'unsure')) not null, `yn_ethics` text check (`yn_ethics` in ('yes', 'no', 'N/A', 'unsure')) not null, `yn_new_data` text check (`yn_new_data` in ('yes', 'no', 'N/A', 'unsure')) not null, `yn_recommend` text check (`yn_recommend` in ('yes', 'no', 'N/A', 'unsure')) not null, `yn_peer_review` text check (`yn_peer_review` in ('yes', 'no', 'N/A', 'unsure')) not null, `yn_available_code` text check (`yn_available_code` in ('yes', 'no', 'N/A', 'unsure')) not null, `yn_available_data` text check (`yn_available_data` in ('yes', 'no', 'N/A', 'unsure')) not null, `link_to_data` text null, `coi` text null);",
    );
    this.addSql(
      'create unique index `rapid_review_uuid_unique` on `rapid_review` (`uuid`);',
    );

    this.addSql(
      'create table `request` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null);',
    );
    this.addSql(
      'create unique index `request_uuid_unique` on `request` (`uuid`);',
    );

    this.addSql(
      'create table `user` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `orcid` varchar not null unique, `is_private` integer not null);',
    );
    this.addSql('create unique index `user_uuid_unique` on `user` (`uuid`);');

    this.addSql(
      'create table `work` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `title` text null, `url` text null, `type` varchar null, `handle` varchar null, `publication_date` datetime null, `publisher` text null);',
    );
    this.addSql('create unique index `work_uuid_unique` on `work` (`uuid`);');

    this.addSql(
      'create table `group` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar not null);',
    );
    this.addSql('create unique index `group_uuid_unique` on `group` (`uuid`);');
    this.addSql('create unique index `group_name_unique` on `group` (`name`);');

    this.addSql(
      'create table `group_members` (`group_id` integer not null, `user_id` integer not null, primary key (`group_id`, `user_id`));',
    );
    this.addSql(
      'create index `group_members_group_id_index` on `group_members` (`group_id`);',
    );
    this.addSql(
      'create index `group_members_user_id_index` on `group_members` (`user_id`);',
    );

    this.addSql(
      'create table `full_review` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `is_published` integer not null, `is_flagged` integer not null, `doi` varchar null, `coi` text null);',
    );
    this.addSql(
      'create unique index `full_review_uuid_unique` on `full_review` (`uuid`);',
    );
    this.addSql(
      'create unique index `full_review_doi_unique` on `full_review` (`doi`);',
    );

    this.addSql(
      'create table `full_review_draft` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `contents` text not null);',
    );
    this.addSql(
      'create unique index `full_review_draft_uuid_unique` on `full_review_draft` (`uuid`);',
    );

    this.addSql(
      'create table `full_review_mentor_invites` (`full_review_id` integer not null, `persona_id` integer not null, primary key (`full_review_id`, `persona_id`));',
    );
    this.addSql(
      'create index `full_review_mentor_invites_full_review_id_index` on `full_review_mentor_invites` (`full_review_id`);',
    );
    this.addSql(
      'create index `full_review_mentor_invites_persona_id_index` on `full_review_mentor_invites` (`persona_id`);',
    );

    this.addSql(
      'create table `full_review_mentors` (`full_review_id` integer not null, `persona_id` integer not null, primary key (`full_review_id`, `persona_id`));',
    );
    this.addSql(
      'create index `full_review_mentors_full_review_id_index` on `full_review_mentors` (`full_review_id`);',
    );
    this.addSql(
      'create index `full_review_mentors_persona_id_index` on `full_review_mentors` (`persona_id`);',
    );

    this.addSql(
      'create table `full_review_author_invites` (`full_review_id` integer not null, `persona_id` integer not null, primary key (`full_review_id`, `persona_id`));',
    );
    this.addSql(
      'create index `full_review_author_invites_full_review_id_index` on `full_review_author_invites` (`full_review_id`);',
    );
    this.addSql(
      'create index `full_review_author_invites_persona_id_index` on `full_review_author_invites` (`persona_id`);',
    );

    this.addSql(
      'create table `full_review_authors` (`full_review_id` integer not null, `persona_id` integer not null, primary key (`full_review_id`, `persona_id`));',
    );
    this.addSql(
      'create index `full_review_authors_full_review_id_index` on `full_review_authors` (`full_review_id`);',
    );
    this.addSql(
      'create index `full_review_authors_persona_id_index` on `full_review_authors` (`persona_id`);',
    );

    this.addSql(
      'create table `contact` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `schema` varchar not null, `value` varchar not null, `is_verified` integer not null, `is_notified` integer not null, `token` varchar null);',
    );
    this.addSql(
      'create unique index `contact_uuid_unique` on `contact` (`uuid`);',
    );

    this.addSql(
      'create table `community` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar not null, `slug` varchar not null, `description` text null, `banner` blob null, `logo` blob null);',
    );
    this.addSql(
      'create unique index `community_uuid_unique` on `community` (`uuid`);',
    );
    this.addSql(
      'create unique index `community_name_unique` on `community` (`name`);',
    );
    this.addSql(
      'create unique index `community_slug_unique` on `community` (`slug`);',
    );

    this.addSql(
      'create table `event` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `title` varchar not null, `start` datetime not null, `is_private` integer not null, `description` text null);',
    );
    this.addSql('create unique index `event_uuid_unique` on `event` (`uuid`);');

    this.addSql(
      'create table `template` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `title` varchar not null, `contents` text not null);',
    );
    this.addSql(
      'create unique index `template_uuid_unique` on `template` (`uuid`);',
    );
    this.addSql(
      'create unique index `template_title_unique` on `template` (`title`);',
    );

    this.addSql(
      'create table `community_members` (`community_id` integer not null, `persona_id` integer not null, primary key (`community_id`, `persona_id`));',
    );
    this.addSql(
      'create index `community_members_community_id_index` on `community_members` (`community_id`);',
    );
    this.addSql(
      'create index `community_members_persona_id_index` on `community_members` (`persona_id`);',
    );

    this.addSql(
      'create table `community_owners` (`community_id` integer not null, `user_id` integer not null, primary key (`community_id`, `user_id`));',
    );
    this.addSql(
      'create index `community_owners_community_id_index` on `community_owners` (`community_id`);',
    );
    this.addSql(
      'create index `community_owners_user_id_index` on `community_owners` (`user_id`);',
    );

    this.addSql(
      'create table `community_preprints` (`community_id` integer not null, `preprint_id` integer not null, primary key (`community_id`, `preprint_id`));',
    );
    this.addSql(
      'create index `community_preprints_community_id_index` on `community_preprints` (`community_id`);',
    );
    this.addSql(
      'create index `community_preprints_preprint_id_index` on `community_preprints` (`preprint_id`);',
    );

    this.addSql(
      'create table `community_tags` (`community_id` integer not null, `tag_id` integer not null, primary key (`community_id`, `tag_id`));',
    );
    this.addSql(
      'create index `community_tags_community_id_index` on `community_tags` (`community_id`);',
    );
    this.addSql(
      'create index `community_tags_tag_id_index` on `community_tags` (`tag_id`);',
    );

    this.addSql(
      'create table `comment` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `contents` text not null, `is_published` integer not null, `is_flagged` integer not null);',
    );
    this.addSql(
      'create unique index `comment_uuid_unique` on `comment` (`uuid`);',
    );

    this.addSql(
      'create table `badge` (`id` integer not null primary key autoincrement, `uuid` varchar not null, `created_at` datetime not null, `updated_at` datetime not null, `name` varchar not null, `color` varchar not null);',
    );
    this.addSql('create unique index `badge_uuid_unique` on `badge` (`uuid`);');
    this.addSql('create unique index `badge_name_unique` on `badge` (`name`);');

    this.addSql(
      'create table `badge_personas` (`badge_id` integer not null, `persona_id` integer not null, primary key (`badge_id`, `persona_id`));',
    );
    this.addSql(
      'create index `badge_personas_badge_id_index` on `badge_personas` (`badge_id`);',
    );
    this.addSql(
      'create index `badge_personas_persona_id_index` on `badge_personas` (`persona_id`);',
    );

    this.addSql('alter table `persona` add column `identity_id` integer null;');
    this.addSql(
      'create index `persona_identity_id_index` on `persona` (`identity_id`);',
    );

    this.addSql(
      'alter table `rapid_review` add column `author_id` integer null;',
    );
    this.addSql(
      'alter table `rapid_review` add column `preprint_id` integer null;',
    );
    this.addSql(
      'create index `rapid_review_author_id_index` on `rapid_review` (`author_id`);',
    );
    this.addSql(
      'create index `rapid_review_preprint_id_index` on `rapid_review` (`preprint_id`);',
    );

    this.addSql('alter table `request` add column `author_id` integer null;');
    this.addSql('alter table `request` add column `preprint_id` integer null;');
    this.addSql(
      'create index `request_author_id_index` on `request` (`author_id`);',
    );
    this.addSql(
      'create index `request_preprint_id_index` on `request` (`preprint_id`);',
    );

    this.addSql(
      'alter table `user` add column `default_persona_id` integer null;',
    );
    this.addSql(
      'create index `user_default_persona_id_index` on `user` (`default_persona_id`);',
    );
    this.addSql(
      'create unique index `user_default_persona_id_unique` on `user` (`default_persona_id`);',
    );

    this.addSql('alter table `work` add column `author_id` integer null;');
    this.addSql('create index `work_author_id_index` on `work` (`author_id`);');

    this.addSql(
      'alter table `full_review` add column `preprint_id` integer null;',
    );
    this.addSql(
      'create index `full_review_preprint_id_index` on `full_review` (`preprint_id`);',
    );

    this.addSql(
      'alter table `full_review_draft` add column `parent_id` integer null;',
    );
    this.addSql(
      'create index `full_review_draft_parent_id_index` on `full_review_draft` (`parent_id`);',
    );

    this.addSql('alter table `contact` add column `identity_id` integer null;');
    this.addSql(
      'create index `contact_identity_id_index` on `contact` (`identity_id`);',
    );

    this.addSql('alter table `event` add column `community_id` integer null;');
    this.addSql(
      'create index `event_community_id_index` on `event` (`community_id`);',
    );

    this.addSql(
      'alter table `template` add column `community_id` integer null;',
    );
    this.addSql(
      'create index `template_community_id_index` on `template` (`community_id`);',
    );

    this.addSql('alter table `comment` add column `author_id` integer null;');
    this.addSql('alter table `comment` add column `parent_id` integer null;');
    this.addSql(
      'create index `comment_author_id_index` on `comment` (`author_id`);',
    );
    this.addSql(
      'create index `comment_parent_id_index` on `comment` (`parent_id`);',
    );
  }
}
