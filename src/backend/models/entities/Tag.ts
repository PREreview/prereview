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
import { TagModel } from '../tags';
import { BaseEntity } from './BaseEntity';
import { Community } from './Community';
import { Preprint } from './Preprint';

@Entity()
export class Tag extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: TagModel;

  @Fixture(faker => `${faker.commerce.color()} ${faker.random.word()}`)
  @Property()
  @Unique()
  name!: string;

  //@Fixture({ get: faker => faker.internet.color(), optional: true })
  @Fixture(faker => faker.internet.color())
  @Property()
  color?: string;

  @ManyToMany({ entity: () => Preprint, inversedBy: 'tags' })
  @Index()
  preprints: Collection<Preprint> = new Collection<Preprint>(this);

  @ManyToMany({ entity: () => Community, mappedBy: 'tags' })
  @Index()
  communities: Collection<Community> = new Collection<Community>(this);

  constructor(name: string, color = '#FF0000') {
    super();
    this.name = name;
    this.color = color;
  }
}
