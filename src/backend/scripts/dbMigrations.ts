import { MikroORM } from '@mikro-orm/core';
import { Migration } from '@mikro-orm/migrations';
import options from '../mikro-orm.config';
import * as sqliteMigrations from '../db/migrations/sqlite';
import * as postgresqlMigrations from '../db/migrations/postgresql';
import { SearchPostgresql } from '../db/migrations/searchIndexes';

async function main() {
  try {
    let migrations: object;
    if (options.type === 'sqlite') {
      migrations = sqliteMigrations;
    } else if (options.type === 'postgresql') {
      migrations = postgresqlMigrations;
    } else {
      throw new Error('Unknown database type.');
    }

    const migrationsList = Object.keys(migrations).map(migrationName => ({
      name: migrationName,
      class: migrations[migrationName],
    }));

    migrationsList.push({ name: 'SearchPostgresql', class: SearchPostgresql });

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
