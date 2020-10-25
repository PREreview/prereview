import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  PrimaryKey,
  Property,
  SerializedPrimaryKey,
  Unique,
} from '@mikro-orm/core';
import CommunityModel from '../communities.ts';
import Preprint from './preprint.ts';
import User from './user.ts';

@Entity()
export default class Community {
  [EntityRepositoryType]: CommunityModel;

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

  @Property()
  description?: string;

  @Property()
  logo?: Buffer;

  @ManyToMany()
  members = new Collection<User>(this);

  @ManyToMany()
  preprints = new Collection<Preprint>(this);

  constructor(name: string, description: string, logo: Buffer) {
    this.name = name;
    this.description = description;
    this.logo = logo;
  }
}
