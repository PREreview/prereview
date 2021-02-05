import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Report } from './entities';

@Repository(Report)
export class ReportModel extends EntityRepository<Report> {}

export function reportModelWrapper(db: MikroORM): ReportModel {
  return db.em.getRepository(Report);
}
