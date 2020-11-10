import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { TagModel } from '../tags';
import { BaseEntity } from './BaseEntity';
import { Preprint } from './Preprint';

@Entity()
export class Tag extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: TagModel;

  @Fixture(faker => faker.hacker.adjective())
  @Property()
  @Unique()
  name!: string;

  //@Fixture({ get: faker => faker.internet.color(), optional: true })
  @Fixture(faker => faker.internet.color())
  @Property()
  color?: string;

  @ManyToMany({ entity: () => Preprint, mappedBy: 'tags', owner: true })
  preprints: Collection<Preprint> = new Collection<Preprint>(this);

  constructor(name: string, color = '#FF0000') {
    super();
    this.name = name;
    this.color = color;
  }
}
