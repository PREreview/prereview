import { MikroORM } from '@mikro-orm/core';
import options from '../mikro-orm.config';
import * as sqliteMigrations from '../db/migrations/sqlite';
import * as postgresqlMigrations from '../db/migrations/postgresql';
import { SearchPostgresql, SearchSqlite } from '../db/migrations/searchIndexes';

interface SearchIndex {
  name: string;
  class: object;
}

async function main() {
  try {
    let migrations: object;
    let searchIndex: SearchIndex;
    if (options.type === 'sqlite') {
      migrations = sqliteMigrations;
      searchIndex = { name: 'SearchSqlite', class: SearchSqlite };
    } else if (options.type === 'postgresql') {
      migrations = postgresqlMigrations;
      searchIndex = { name: 'SearchPostgresql', class: SearchPostgresql };
    } else {
      throw new Error('Unknown database type.');
    }

    const migrationsList = Object.keys(migrations).map(migrationName => ({
      name: migrationName,
      class: migrations[migrationName],
    }));

    migrationsList.push(searchIndex);

    const orm = await MikroORM.init({
      ...options,
      migrations: { migrationsList },
    });

    const migrator = orm.getMigrator();
    await migrator.up(); // runs migrations up to the latest
    await orm.close(true);
  } catch (err) {
    console.error('Failed to run migrations:', err);
  }
}

main();
