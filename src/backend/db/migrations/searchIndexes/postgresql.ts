import { Migration } from '@mikro-orm/migrations';

export class SearchPostgresql extends Migration {
  async up(): Promise<void> {
    this.addSql('ALTER TABLE "preprint" ADD COLUMN "fts" TSVECTOR;');
    this.addSql(
      "CREATE FUNCTION preprint_fts_trigger() RETURNS trigger AS \
                $$ BEGIN new.fts := setweight(to_tsvector('english', new.title), 'A') || setweight(to_tsvector('english', new.handle), 'B'); return new; END; $$ LANGUAGE plpgsql;",
    );
    this.addSql(
      'CREATE TRIGGER preprint_fts_trigger_update \
                  BEFORE INSERT OR UPDATE \
                  ON "preprint" \
                  FOR EACH ROW \
                  EXECUTE FUNCTION preprint_fts_trigger();',
    );
    this.addSql(
      'CREATE INDEX "preprint_fts_idx" ON "preprint" USING GIN (fts);',
    );
    this.addSql('ALTER TABLE "full_review_draft" ADD COLUMN "fts" TSVECTOR;');
    this.addSql(
      "CREATE FUNCTION full_review_draft_fts_trigger() RETURNS trigger AS \
                $$ BEGIN new.fts := to_tsvector('english', new.contents); return new; END; $$ LANGUAGE plpgsql;",
    );
    this.addSql(
      'CREATE TRIGGER full_review_draft_fts_trigger_update \
                  BEFORE INSERT OR UPDATE \
                  ON "full_review_draft" \
                  FOR EACH ROW \
                  EXECUTE FUNCTION full_review_draft_fts_trigger();',
    );
    this.addSql(
      'CREATE INDEX "full_review_draft_fts_idx" ON "full_review_draft" USING GIN (fts);',
    );
  }
}
