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
import User from './User';

@Entity()
export class Group {
  [EntityRepositoryType]?: GroupModel;

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  @Unique()
  name!: string;

  @ManyToMany()
  members = new Collection<User>(this);

  constructor(name: string) {
    this.name = name;
  }
}
