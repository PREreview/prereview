import { MikroORM } from '@mikro-orm/core';
import dbConfig from '../mikro-orm.config';
import { groupModelWrapper } from '../models';

async function main() {
  try {
    const db = await MikroORM.init(dbConfig);
    const groups = groupModelWrapper(db);
    const adminGroup = groups.create({ name: 'admins' });
    console.log('Created admins group:', adminGroup);
    const userGroup = groups.create({ name: 'users' });
    console.log('Created users group:', userGroup);
    const modsGroup = groups.create({ name: 'moderators' });
    console.log('Created moderators group:', modsGroup);
    const partnersGroup = groups.create({ name: 'partners' });
    console.log('Created partners group:', partnersGroup);
    await groups.persistAndFlush([
      adminGroup,
      userGroup,
      modsGroup,
      partnersGroup,
    ]);
    db.close();
    return;
  } catch (err) {
    console.error('Failed to run seeds:', err);
  }
}

main();
