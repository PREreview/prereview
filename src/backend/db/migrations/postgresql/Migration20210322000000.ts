import { Migration } from '@mikro-orm/migrations';

export class Migration20210322000000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create index "badge_personas_badge_id_index" on "badge_personas" ("badge_id");',
    );
    this.addSql(
      'create index "badge_personas_persona_id_index" on "badge_personas" ("persona_id");',
    );
    this.addSql(
      'create index "comment_author_id_index" on "comment" ("author_id");',
    );
    this.addSql(
      'create index "comment_parent_id_index" on "comment" ("parent_id");',
    );
    this.addSql(
      'create index "community_members_community_id_index" on "community_members" ("community_id");',
    );
    this.addSql(
      'create index "community_members_persona_id_index" on "community_members" ("persona_id");',
    );
    this.addSql(
      'create index "community_owners_community_id_index" on "community_owners" ("community_id");',
    );
    this.addSql(
      'create index "community_owners_user_id_index" on "community_owners" ("user_id");',
    );
    this.addSql(
      'create index "community_preprints_community_id_index" on "community_preprints" ("community_id");',
    );
    this.addSql(
      'create index "community_preprints_preprint_id_index" on "community_preprints" ("preprint_id");',
    );
    this.addSql(
      'create index "community_tags_community_id_index" on "community_tags" ("community_id");',
    );
    this.addSql(
      'create index "community_tags_tag_id_index" on "community_tags" ("tag_id");',
    );
    this.addSql(
      'create index "contact_identity_id_index" on "contact" ("identity_id");',
    );
    this.addSql(
      'create index "event_community_id_index" on "event" ("community_id");',
    );
    this.addSql(
      'create index "full_review_preprint_id_index" on "full_review" ("preprint_id");',
    );
    this.addSql(
      'create index "full_review_author_invites_full_review_id_index" on "full_review_author_invites" ("full_review_id");',
    );
    this.addSql(
      'create index "full_review_author_invites_persona_id_index" on "full_review_author_invites" ("persona_id");',
    );
    this.addSql(
      'create index "full_review_authors_full_review_id_index" on "full_review_authors" ("full_review_id");',
    );
    this.addSql(
      'create index "full_review_authors_persona_id_index" on "full_review_authors" ("persona_id");',
    );
    this.addSql(
      'create index "full_review_draft_parent_id_index" on "full_review_draft" ("parent_id");',
    );
    this.addSql(
      'create index "full_review_mentor_invites_full_review_id_index" on "full_review_mentor_invites" ("full_review_id");',
    );
    this.addSql(
      'create index "full_review_mentor_invites_persona_id_index" on "full_review_mentor_invites" ("persona_id");',
    );
    this.addSql(
      'create index "full_review_mentors_full_review_id_index" on "full_review_mentors" ("full_review_id");',
    );
    this.addSql(
      'create index "full_review_mentors_persona_id_index" on "full_review_mentors" ("persona_id");',
    );
    this.addSql(
      'create index "group_members_group_id_index" on "group_members" ("group_id");',
    );
    this.addSql(
      'create index "group_members_user_id_index" on "group_members" ("user_id");',
    );
    this.addSql(
      'create index "persona_identity_id_index" on "persona" ("identity_id");',
    );
    this.addSql(
      'create index "rapid_review_author_id_index" on "rapid_review" ("author_id");',
    );
    this.addSql(
      'create index "rapid_review_preprint_id_index" on "rapid_review" ("preprint_id");',
    );
    this.addSql(
      'create index "report_author_id_index" on "report" ("author_id");',
    );
    this.addSql(
      'create index "request_author_id_index" on "request" ("author_id");',
    );
    this.addSql(
      'create index "request_preprint_id_index" on "request" ("preprint_id");',
    );
    this.addSql(
      'create index "statement_author_id_index" on "statement" ("author_id");',
    );
    this.addSql(
      'create index "statement_parent_id_index" on "statement" ("parent_id");',
    );
    this.addSql(
      'create index "template_community_id_index" on "template" ("community_id");',
    );
    this.addSql(
      'create index "user_default_persona_id_index" on "user" ("default_persona_id");',
    );
    this.addSql('create index "work_author_id_index" on "work" ("author_id");');
  }
}
