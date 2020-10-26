import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { PersonaModel } from '../personas';
import User from './user';

@Entity()
export default class Persona {
  [EntityRepositoryType]?: PersonaModel;

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  @Unique()
  name!: string;

  @ManyToOne()
  identity!: User;

  @Property()
  avatar?: Buffer;

  constructor(name: string, avatar: Buffer) {
    this.name = name;
    this.avatar = avatar;
  }
}
