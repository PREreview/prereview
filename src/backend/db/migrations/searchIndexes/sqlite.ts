import { Migration } from '@mikro-orm/migrations';

export class SearchSqlite extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'CREATE VIRTUAL TABLE "preprint_fts" USING fts5( \
                title, \
                handle, \
                published UNINDEXED, \
                preprint_server UNINDEXED, \
                date_posted UNINDEXED, \
                url UNINDEXED, \
                content_encoding UNINDEXED, \
                content_url UNINDEXED, \
                content="preprint", \
                content_rowid="id" \
               )',
    );
    this.addSql(
      'CREATE TRIGGER preprint_after_insert AFTER INSERT ON "preprint" \
        BEGIN \
          INSERT INTO "preprint_fts" (rowid, title, handle, published, preprint_server, date_posted, url, content_encoding, content_url) \
          VALUES (new.id, new.title, new.handle, new.published, new.preprint_server, new.date_posted, new.url, new.content_encoding, new.content_url); \
        END;',
    );
    this.addSql(
      'CREATE TRIGGER preprint_after_delete AFTER DELETE ON "preprint" \
        BEGIN \
          INSERT INTO "preprint_fts" (preprint_fts, rowid, title, handle, published, preprint_server, date_posted, url, content_encoding, content_url) \
          VALUES ("delete", old.id, old.title, old.handle, old.published, old.preprint_server, old.date_posted, old.url, old.content_encoding, old.content_url); \
        END;',
    );
    this.addSql(
      'CREATE TRIGGER preprint_after_update AFTER UPDATE ON "preprint" \
        BEGIN \
          INSERT INTO "preprint_fts" (preprint_fts, rowid, title, handle, published, preprint_server, date_posted, url, content_encoding, content_url) \
          VALUES ("delete", old.id, old.title, old.handle, old.published, old.preprint_server, old.date_posted, old.url, old.content_encoding, old.content_url); \
          INSERT INTO "preprint_fts" (rowid, title, handle, published, preprint_server, date_posted, url, content_encoding, content_url) \
          VALUES (new.id, new.title, new.handle, new.published, new.preprint_server, new.date_posted, new.url, new.content_encoding, new.content_url); \
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
