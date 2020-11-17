import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { User } from './entities';

@Repository(User)
export class UserModel extends EntityRepository<User> {}

export function userModelWrapper(db: MikroORM): UserModel {
  return db.em.getRepository(User);
}
