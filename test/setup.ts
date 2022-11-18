import { EntityData, MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import faker from 'faker';
import { RequestListener } from 'http';
import nock from 'nock';
import { IBackup, newDb } from 'pg-mem';
import dbConfig from '../src/backend/mikro-orm.config';
import {
  groupModelWrapper,
  keyModelWrapper,
  personaModelWrapper,
  preprintModelWrapper,
  requestModelWrapper,
  userModelWrapper,
} from '../src/backend/models';
import {
  Group,
  Key,
  Persona,
  Preprint,
  Request,
  User,
} from '../src/backend/models/entities';
import configServer from '../src/backend/server';
import { fakeDoi, fakeOrcid } from './utils';

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

global.beforeEach(() => {
  backup.restore();
});

global.afterEach(() => {
  nock.cleanAll();
});

global.afterAll(async () => {
  await orm.close(true);
});

export async function createRequest(
  data?: EntityData<Request>,
): Promise<Request> {
  const requests = requestModelWrapper(orm);

  const request = requests.create({
    author: (await createUser()).defaultPersona,
    preprint: await createPreprint(),
    ...data,
  });

  await requests.persistAndFlush(request);

  return request;
}

export async function createPreprint(
  data?: EntityData<Preprint>,
): Promise<Preprint> {
  const preprints = preprintModelWrapper(orm);

  const preprint = preprints.create({
    handle: `doi:${fakeDoi()}`,
    title: faker.lorem.sentence(),
    ...data,
  });

  await preprints.persistAndFlush(preprint);

  return preprint;
}

export async function createGroup(name: string): Promise<Group> {
  const groups = groupModelWrapper(orm);

  const group = groups.create({ name });

  await groups.persistAndFlush(group);

  return group;
}

export async function createUser(group?: Group, persona?: Persona): Promise<User> {
  const users = userModelWrapper(orm);

  const user = users.create({ orcid: fakeOrcid() });
  user.defaultPersona = await createPersona(user, false);
  if (persona) {
    user.personas.add(persona)
  }

  if (group) {
    user.groups.add(group);
  }

  await users.persistAndFlush(user);

  return user;
}

export async function createPersona(user: User, isAnonymous: boolean): Promise<Persona> {
  const personas = personaModelWrapper(orm);

  const persona = personas.create({
    isAnonymous,
    identity: user,
    name: faker.name.findName(),
  });

  await personas.persistAndFlush(persona);

  return persona;
}

export async function createApiKey(user: User): Promise<Key> {
  const keys = keyModelWrapper(orm);

  const key = keys.create({
    owner: user,
    app: 'jest',
    secret: 'not-a-secret',
  });

  await keys.persistAndFlush(key);

  return key;
}

export async function createServer(config = {}): Promise<RequestListener> {
  return await configServer(orm, {
    logLevel: 'off',
    orcidCallbackUrl: 'http://localhost/',
    orcidClientId: 'orcid-client-id',
    ...config,
  });
}
