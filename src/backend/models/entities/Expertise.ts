import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { ExpertiseModel } from '../expertises';
import { BaseEntity } from './BaseEntity';
import { Persona } from './Persona';

@Entity()
export class Expertise extends BaseEntity {
  [EntityRepositoryType]?: ExpertiseModel;

  @Fixture(faker => `${faker.commerce.color()} ${faker.random.word()}`)
  @Property()
  @Unique()
  name!: string;

  @ManyToMany({ entity: () => Persona, inversedBy: 'expertises' })
  personas: Collection<Persona> = new Collection<Persona>(this);

  constructor(name: string) {
    super();
    this.name = name;
  }
}
