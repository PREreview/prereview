import { FixtureFactory } from '@mikro-resources/fixtures';
import { MikroORM } from '@mikro-orm/core';
import { Preprint } from './models/entities';

async function main() {
  try {
    const orm = await MikroORM.init();
    const factory = new FixtureFactory(orm, { logging: true, maxDepth: 4 });

    // Generate and persist
    const result = factory.make(Preprint);
    const seed = await result.oneAndPersist();
    console.log('Seed inserted:', seed);
    await orm.close();
    return;
  } catch (err) {
    console.error('Failed to run seeds:', err);
  }
}

main();
