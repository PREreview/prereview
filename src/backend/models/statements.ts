import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { Statement } from './entities';

export class StatementModel extends EntityRepository<Statement> {}

export function statementModelWrapper(db: MikroORM): StatementModel {
  return db.em.getRepository(Statement);
}
