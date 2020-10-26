import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import Preprint from './entities/Preprint';

@Repository(Preprint)
export class PreprintModel extends EntityRepository<Preprint> {}

const preprintModelWrapper = (db: MikroORM): PreprintModel =>
  db.em.getRepository(Preprint);

export default preprintModelWrapper;
