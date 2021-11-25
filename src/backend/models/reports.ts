import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { Report } from './entities';

export class ReportModel extends EntityRepository<Report> {}

export function reportModelWrapper(db: MikroORM): ReportModel {
  return db.em.getRepository(Report);
}
