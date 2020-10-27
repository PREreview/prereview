import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import User from './entities/user';

@Repository(User)
export class UserModel extends EntityRepository<User> {}

const userModelWrapper = (db: MikroORM): UserModel => db.em.getRepository(User);

export default userModelWrapper;
