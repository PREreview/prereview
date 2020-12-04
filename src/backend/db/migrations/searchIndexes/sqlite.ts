import { Migration } from '@mikro-orm/migrations';

export class SearchSqlite extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'CREATE VIRTUAL TABLE "preprint_fts" USING fts5( \
                title, \
                handle, \
                preprintServer UNINDEXED, \
                url UNINDEXED, \
                contentEncoding UNINDEXED, \
                contentUrl UNINDEXED, \
                content="preprint", \
                content_rowid="id" \
               )',
    );
    this.addSql(
      'CREATE TRIGGER preprint_after_insert AFTER INSERT ON "preprint" \
        BEGIN \
          INSERT INTO "preprint_fts" (rowid, title, handle) \
          VALUES (new.id, new.title, new.handle); \
        END;',
    );
    this.addSql(
      'CREATE TRIGGER preprint_after_delete AFTER DELETE ON "preprint" \
        BEGIN \
          INSERT INTO "preprint_fts" (preprint_fts, rowid, title, handle) \
          VALUES ("delete", old.id, old.title, old.handle); \
        END;',
    );
    this.addSql(
      'CREATE TRIGGER preprint_after_update AFTER UPDATE ON "preprint" \
        BEGIN \
          INSERT INTO "preprint_fts" (preprint_fts, rowid, title, handle) \
          VALUES ("delete", old.id, old.title, old.handle); \
          INSERT INTO "preprint_fts" (rowid, title, handle) \
          VALUES (new.id, new.title, new.handle); \
        END;',
    );
    this.addSql(
      'CREATE VIRTUAL TABLE "full_review_draft_fts" USING fts5( \
                title, \
                contents, \
                content="full_review_draft", \
                content_rowid="id" \
               )',
    );
    this.addSql(
      'CREATE TRIGGER full_review_draft_after_insert AFTER INSERT ON "full_review_draft" \
        BEGIN \
          INSERT INTO "full_review_draft_fts" (rowid, title, contents) \
          VALUES (new.id, new.title, new.contents); \
        END;',
    );
    this.addSql(
      'CREATE TRIGGER full_review_draft_after_delete AFTER DELETE ON "full_review_draft" \
        BEGIN \
          INSERT INTO "full_review_draft_fts" (full_review_draft_fts, rowid, title, contents) \
          VALUES ("delete", old.id, old.title, old.contents); \
        END;',
    );
    this.addSql(
      'CREATE TRIGGER full_review_draft_after_update AFTER UPDATE ON "full_review_draft" \
        BEGIN \
          INSERT INTO "full_review_draft_fts" (full_review_draft_fts, rowid, title, contents) \
          VALUES ("delete", old.id, old.title, old.contents); \
          INSERT INTO "full_review_draft_fts" (rowid, title, contents) \
          VALUES (new.id, new.title, new.contents); \
        END;',
    );
  }
}
