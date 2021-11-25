import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { Contact } from './entities';

export class ContactModel extends EntityRepository<Contact> {}

export function contactModelWrapper(db: MikroORM): ContactModel {
  return db.em.getRepository(Contact);
}
