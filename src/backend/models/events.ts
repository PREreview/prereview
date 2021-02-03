import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Event } from './entities';

@Repository(Event)
export class EventModel extends EntityRepository<Event> {}

export function eventModelWrapper(db: MikroORM): EventModel {
  return db.em.getRepository(Event);
}
