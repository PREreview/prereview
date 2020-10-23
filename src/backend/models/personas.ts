import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import Persona from './entities/persona.ts';

@Repository(Persona)
class PersonaModel extends EntityRepository<Persona> {}

const personaModelWrapper = (db: MikroORM): PersonaModel =>
  db.em.getRepository(Persona);

export default personaModelWrapper;
