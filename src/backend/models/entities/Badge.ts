import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { BadgeModel } from '../badges';
import { BaseEntity } from './BaseEntity';
import { Persona } from './Persona';

@Entity()
export class Badge extends BaseEntity {
  [EntityRepositoryType]?: BadgeModel;

  @Property()
  @Unique()
  name!: string;

  @Property()
  color?: string;

  @ManyToMany({ entity: () => Persona, inversedBy: 'badges' })
  personas: Collection<Persona> = new Collection<Persona>(this);

  constructor(name: string, color = '#FF0000') {
    super();
    this.name = name;
    this.color = color;
  }
}
