import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import Persona from './entities/persona';

@Repository(Persona)
export class PersonaModel extends EntityRepository<Persona> {}

const personaModelWrapper = (db: MikroORM): PersonaModel =>
  db.em.getRepository(Persona);

export default personaModelWrapper;
