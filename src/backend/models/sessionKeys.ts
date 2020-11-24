import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { SessionKey } from './entities';

@Repository(SessionKey)
export class SessionKeyModel extends EntityRepository<SessionKey> {}

export function sessionKeyModelWrapper(db: MikroORM): SessionKeyModel {
  return db.em.getRepository(SessionKey);
}
