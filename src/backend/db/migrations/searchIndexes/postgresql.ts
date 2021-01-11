import { Migration } from '@mikro-orm/migrations';

export class SearchPostgresql extends Migration {
  async up(): Promise<void> {
    this.addSql('ALTER TABLE "preprint" ADD COLUMN "fts" TSVECTOR;');
    this.addSql(
      "CREATE FUNCTION preprint_fts_trigger() RETURNS trigger AS \
                $$ BEGIN new.fts := setweight(to_tsvector('english', new.title), 'A') || setweight(to_tsvector('english', new.handle), 'B') || setweight(to_tsvector('english', new.abstract_text), 'C'); return new; END; $$ LANGUAGE plpgsql;",
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
    this.addSql('ALTER TABLE "persona" ADD COLUMN "fts" TSVECTOR;');
    this.addSql(
      "CREATE FUNCTION persona_fts_trigger() RETURNS trigger AS \
                $$ BEGIN new.fts := setweight(to_tsvector('english', new.name), 'A') || setweight(to_tsvector('english', new.bio), 'B'); return new; END; $$ LANGUAGE plpgsql;",
    );
    this.addSql(
      'CREATE TRIGGER persona_fts_trigger_update \
                  BEFORE INSERT OR UPDATE \
                  ON "persona" \
                  FOR EACH ROW \
                  EXECUTE FUNCTION persona_fts_trigger();',
    );
    this.addSql('CREATE INDEX "persona_fts_idx" ON "persona" USING GIN (fts);');
  }
}
