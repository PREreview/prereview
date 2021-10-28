import { MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { RequestListener } from 'http';
import nock from 'nock';
import { IBackup, newDb } from 'pg-mem';
import dbConfig from '../src/backend/mikro-orm.config';
import configServer from '../src/backend/server';

let orm: MikroORM<PostgreSqlDriver>;
let backup: IBackup;

global.beforeAll(async () => {
  nock.enableNetConnect('127.0.0.1');

  const db = newDb();
  orm = await db.adapters.createMikroOrm(dbConfig);
  const generator = orm.getSchemaGenerator();

  await generator.createSchema();

  backup = db.backup();
});

global.afterEach(() => {
  nock.cleanAll();
});

global.afterAll(async () => {
  await orm.close(true);
});

export async function createServer(config = {}): Promise<RequestListener> {
  backup.restore();

  return await configServer(orm, {
    logLevel: 'off',
    orcidCallbackUrl: 'http://localhost/',
    orcidClientId: 'orcid-client-id',
    ...config,
  });
}
