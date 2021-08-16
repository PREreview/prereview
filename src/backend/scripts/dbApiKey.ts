import { MikroORM } from '@mikro-orm/core';
import {
  keyModelWrapper,
  personaModelWrapper,
  userModelWrapper,
} from '../models';
import config from '../mikro-orm.config';

async function main() {
  try {
    const orm = await MikroORM.init(config);
    const users = userModelWrapper(orm);
    const personas = personaModelWrapper(orm);
    const keys = keyModelWrapper(orm);

    const user = users.create({ orcid: process.env.TEST_ADMIN_USER_ORCID });
    const publicPersona = personas.create({
      identity: user,
      name: 'PREreview Test User',
      isAnonymous: false,
    });
    user.defaultPersona = publicPersona;
    const key = keys.create({
      owner: user,
      app: process.env.TEST_ADMIN_USER_API_APP,
      secret: process.env.TEST_ADMIN_USER_API_KEY,
    });

    await users.persistAndFlush(user);
    await personas.persistAndFlush(publicPersona);
    await keys.persistAndFlush(key);

    await orm.close();
    return;
  } catch (err) {
    console.error('Failed to create API key:', err);
  }
}

main();
