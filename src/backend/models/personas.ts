import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { ORCID as orcidUtils } from 'orcid-utils';
import { validate as uuidValidate } from 'uuid';
import { Persona, User } from './entities';
import { getLogger } from '../log.js';

const log = getLogger('backend:models:personas');

@Repository(Persona)
export class PersonaModel extends EntityRepository<Persona> {
  async isIdentityOf(personaId: string, userId: string): Promise<boolean> {
    let persona: Persona | null = null;
    if (uuidValidate(personaId)) {
      persona = await this.findOne({ uuid: personaId });
    }

    if (!persona) {
      log.warn(`No such persona ${personaId}`);
      return false;
    }

    let user: User | null = null;
    if (orcidUtils.isValid(userId)) {
      user = await this.em.findOne(User, { orcid: userId as string }, ['personas']);
    } else if (uuidValidate(userId)) {
      user = await this.em.findOne(User, { uuid: userId as string }, ['personas']);
    }

    if (!user) return false;
    return user.personas.contains(persona);
  }
}

export function personaModelWrapper(db: MikroORM): PersonaModel {
  return db.em.getRepository(Persona);
}
