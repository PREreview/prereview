import { Collection, EntitySchema } from '@mikro-orm/core';
import { ExpertiseModel } from '../expertises';
import { BaseEntity } from './BaseEntity';
import { Persona } from './Persona';

export class Expertise extends BaseEntity {
  name!: string;
  personas: Collection<Persona> = new Collection<Persona>(this);

  constructor(name: string) {
    super();
    this.name = name;
  }
}

export const expertiseSchema = new EntitySchema<Expertise, BaseEntity>({
  class: Expertise,
  customRepository: () => ExpertiseModel,
  properties: {
    name: { type: 'string', unique: true },
    personas: {
      reference: 'm:n',
      entity: () => Persona,
      inversedBy: (persona) => persona.expertises,
    },
  },
});
