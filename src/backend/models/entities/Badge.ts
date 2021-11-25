import { Collection, EntitySchema } from '@mikro-orm/core';
import { BadgeModel } from '../badges';
import { BaseEntity } from './BaseEntity';
import { Persona } from './Persona';

export class Badge extends BaseEntity {
  name!: string;
  color?: string;
  personas: Collection<Persona> = new Collection<Persona>(this);

  constructor(name: string, color = '#FF0000') {
    super();
    this.name = name;
    this.color = color;
  }
}

export const badgeSchema = new EntitySchema<Badge, BaseEntity>({
  class: Badge,

  customRepository: () => BadgeModel,
  properties: {
    name: { type: 'string', unique: true },
    color: { type: 'string' },
    personas: {
      reference: 'm:n',
      entity: () => Persona,
      inversedBy: (persona) => persona.badges,
    },
  },
});
