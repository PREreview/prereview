import { dbWrapper } from '../db';
import { groupModelWrapper } from '../models';

async function main() {
  try {
    const [db] = await dbWrapper();
    const groups = groupModelWrapper(db);
    const adminGroup = groups.create({ name: 'admins' });
    console.log('Created admins group:', adminGroup);
    const userGroup = groups.create({ name: 'users' });
    console.log('Created users group:', userGroup);
    const modsGroup = groups.create({ name: 'moderators' });
    console.log('Created moderators group:', modsGroup);
    await groups.persistAndFlush([adminGroup, userGroup, modsGroup]);
    db.close();
    return;
  } catch (err) {
    console.error('Failed to run seeds:', err);
  }
}

main();
