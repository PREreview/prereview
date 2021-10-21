import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { GroupModel } from '../groups';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity()
export class Group extends BaseEntity {
  [EntityRepositoryType]?: GroupModel;

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
