import { Migration } from '@mikro-orm/migrations';

export class SearchPostgresql extends Migration {
  async up(): Promise<void> {
    this.addSql('CREATE EXTENSION pg_trgm;');
    this.addSql(
      'CREATE INDEX "preprint_trgm" ON "preprint" USING GIN (title gin_trgm_ops, handle gin_trgm_ops, abstract_text gin_trgm_ops, authors gin_trgm_ops);',
    );
    this.addSql(
      'CREATE INDEX "persona_trgm" ON "persona" USING GIN (name gin_trgm_ops, bio gin_trgm_ops);',
    );
  }
}
