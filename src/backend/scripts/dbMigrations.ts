import { MikroORM } from '@mikro-orm/core';
import options from '../mikro-orm.config';
import * as migrations from '../db/migrations/postgresql';
import { SearchPostgresql } from '../db/migrations/searchIndexes';

async function main() {
  const migrationsList = Object.entries(migrations).map(
    ([migrationName, migrationClass]) => ({
      name: migrationName,
      class: migrationClass,
    }),
  );

  migrationsList.splice(1, 0, {
    name: 'SearchPostgresql',
    class: SearchPostgresql,
  });

  const orm = await MikroORM.init({
    ...options,
    migrations: {
      disableForeignKeys: false,
      migrationsList,
    },
  });

  const migrator = orm.getMigrator();
  await migrator.up(); // runs migrations up to the latest
  await orm.close(true);
}

void main();
