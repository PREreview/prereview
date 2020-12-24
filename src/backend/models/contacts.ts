import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Contact } from './entities';

@Repository(Contact)
export class ContactModel extends EntityRepository<Contact> {}

export function contactModelWrapper(db: MikroORM): ContactModel {
  return db.em.getRepository(Contact);
}
