import { Migration } from '@mikro-orm/migrations';

export class SearchSqlite extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'CREATE VIRTUAL TABLE "preprint_fts" USING fts5( \
                title, \
                handle, \
                abstract_text, \
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
          INSERT INTO "preprint_fts" (rowid, title, handle, abstract_text, published, preprint_server, date_posted, url, content_encoding, content_url) \
          VALUES (new.id, new.title, new.handle, new.abstract_text, new.published, new.preprint_server, new.date_posted, new.url, new.content_encoding, new.content_url); \
        END;',
    );
    this.addSql(
      'CREATE TRIGGER preprint_after_delete AFTER DELETE ON "preprint" \
        BEGIN \
          INSERT INTO "preprint_fts" (preprint_fts, rowid, title, handle, abstract_text, published, preprint_server, date_posted, url, content_encoding, content_url) \
          VALUES ("delete", old.id, old.title, old.handle, old.abstract_text, old.published, old.preprint_server, old.date_posted, old.url, old.content_encoding, old.content_url); \
        END;',
    );
    this.addSql(
      'CREATE TRIGGER preprint_after_update AFTER UPDATE ON "preprint" \
        BEGIN \
          INSERT INTO "preprint_fts" (preprint_fts, rowid, title, handle, abstract_text, published, preprint_server, date_posted, url, content_encoding, content_url) \
          VALUES ("delete", old.id, old.title, old.handle, old.abstract_text, old.published, old.preprint_server, old.date_posted, old.url, old.content_encoding, old.content_url); \
          INSERT INTO "preprint_fts" (rowid, title, handle, abstract_text, published, preprint_server, date_posted, url, content_encoding, content_url) \
          VALUES (new.id, new.title, new.handle, new.abstract_text, new.published, new.preprint_server, new.date_posted, new.url, new.content_encoding, new.content_url); \
        END;',
    );
    this.addSql(
      'CREATE VIRTUAL TABLE "persona_fts" USING fts5( \
                name, \
                bio, \
                content="persona", \
                content_rowid="id" \
               )',
    );
    this.addSql(
      'CREATE TRIGGER persona_after_insert AFTER INSERT ON "persona" \
        BEGIN \
          INSERT INTO "persona_fts" (rowid, name, bio) \
          VALUES (new.id, new.name, new.bio); \
        END;',
    );
    this.addSql(
      'CREATE TRIGGER persona_after_delete AFTER DELETE ON "persona" \
        BEGIN \
          INSERT INTO "persona_fts" (persona_fts, rowid, name, bio) \
          VALUES ("delete", old.id, old.name, old.bio); \
        END;',
    );
    this.addSql(
      'CREATE TRIGGER persona_after_update AFTER UPDATE ON "persona" \
        BEGIN \
          INSERT INTO "persona_fts" (persona_fts, rowid, name, bio) \
          VALUES ("delete", old.id, old.name, old.bio); \
          INSERT INTO "persona_fts" (rowid, name, bio) \
          VALUES (new.id, new.name, new.bio); \
        END;',
    );
  }
}
