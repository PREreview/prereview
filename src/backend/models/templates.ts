import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Template } from './entities';

@Repository(Template)
export class TemplateModel extends EntityRepository<Template> {}

export function templateModelWrapper(db: MikroORM): TemplateModel {
  return db.em.getRepository(Template);
}
