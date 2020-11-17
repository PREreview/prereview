import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Persona } from './entities';

@Repository(Persona)
export class PersonaModel extends EntityRepository<Persona> {}

export function personaModelWrapper(db: MikroORM): PersonaModel {
  return db.em.getRepository(Persona);
}
