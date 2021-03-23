import {
  Collection,
  Entity,
  EntityRepositoryType,
  Index,
  ManyToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { BadgeModel } from '../badges';
import { BaseEntity } from './BaseEntity';
import { Persona } from './Persona';

@Entity()
export class Badge extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: BadgeModel;

  @Fixture(faker => `${faker.commerce.color()} ${faker.random.word()}`)
  @Property()
  @Unique()
  name!: string;

  //@Fixture({ get: faker => faker.internet.color(), optional: true })
  @Fixture(faker => faker.internet.color())
  @Property()
  color?: string;

  @ManyToMany({ entity: () => Persona, inversedBy: 'badges' })
  @Index()
  personas: Collection<Persona> = new Collection<Persona>(this);

  constructor(name: string, color = '#FF0000') {
    super();
    this.name = name;
    this.color = color;
  }
}
