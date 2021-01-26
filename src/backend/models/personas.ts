import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Persona } from './entities';
import { isString } from '../../common/utils/strings';
import { ChainError } from '../../common/errors';

@Repository(Persona)
export class PersonaModel extends EntityRepository<Persona> {
  findOneByIdOrName(value: number | string, params: string[]): any {
    if (Number.isInteger(value)) {
      return this.findOne(value as number, params);
    } else if (isString(value)) {
      return this.findOne({ name: value as string }, params);
    }
    throw new ChainError(`'${value}' is not a valid ID or ORCID`);
  }
}

export function personaModelWrapper(db: MikroORM): PersonaModel {
  return db.em.getRepository(Persona);
}
