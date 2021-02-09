import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Statement } from './entities';

@Repository(Statement)
export class StatementModel extends EntityRepository<Statement> {}

export function statementModelWrapper(db: MikroORM): StatementModel {
  return db.em.getRepository(Statement);
}
