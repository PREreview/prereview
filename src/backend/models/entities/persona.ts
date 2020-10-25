import {
  Entity,
  EntityRepositoryType,
  PrimaryKey,
  Property,
  SerializedPrimaryKey,
  Unique,
} from '@mikro-orm/core';
import PersonaModel from '../personas.ts';
import User from './user.ts';

@Entity()
export default class Persona {
  [EntityRepositoryType]: PersonaModel;

  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

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
