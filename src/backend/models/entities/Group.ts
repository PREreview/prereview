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
import { GroupModel } from '../groups';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity()
@Index({ properties: ['members'] })
export class Group extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: GroupModel;

  @Fixture(faker => `${faker.commerce.color()} ${faker.random.word()}`)
  @Property()
  @Unique()
  name!: string;

  @ManyToMany({ entity: () => User, inversedBy: 'groups' })
  members: Collection<User> = new Collection<User>(this);

  constructor(name: string) {
    super();
    this.name = name;
  }
}
