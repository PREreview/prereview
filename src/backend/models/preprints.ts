import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import Preprint from './entities/preprint.ts';

@Repository(Preprint)
class PreprintModel extends EntityRepository<Preprint> {}

const preprintModelWrapper = (db: MikroORM): PreprintModel =>
  db.em.getRepository(Preprint);

export default preprintModelWrapper;
