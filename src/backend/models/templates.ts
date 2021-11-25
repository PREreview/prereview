import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { Template } from './entities';

export class TemplateModel extends EntityRepository<Template> {}

export function templateModelWrapper(db: MikroORM): TemplateModel {
  return db.em.getRepository(Template);
}
