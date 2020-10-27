import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { GroupModel } from '../groups';
import User from './user';

@Entity()
export default class Group {
  [EntityRepositoryType]: GroupModel;

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  @Unique()
  name!: string;

  @ManyToMany('User', 'groups', { owner: true })
  members = new Collection<User>(this);

  constructor(name: string) {
    this.name = name;
  }
}
