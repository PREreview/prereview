import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { CommunityModel } from '../communities';
import Preprint from './preprint';
import User from './user';

@Entity()
export default class Community {
  [EntityRepositoryType]: CommunityModel;

  @PrimaryKey()
  id!: number;

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

  @ManyToMany('User', 'communities', { owner: true })
  members = new Collection<User>(this);

  @ManyToMany('Preprint', 'communities', { owner: true })
  preprints = new Collection<Preprint>(this);

  constructor(name: string, description: string, logo: Buffer) {
    this.name = name;
    this.description = description;
    this.logo = logo;
  }
}
