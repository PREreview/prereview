import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { Event } from './entities';

export class EventModel extends EntityRepository<Event> {}

export function eventModelWrapper(db: MikroORM): EventModel {
  return db.em.getRepository(Event);
}
