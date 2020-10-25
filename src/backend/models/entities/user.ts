import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
  SerializedPrimaryKey,
  Unique,
} from '@mikro-orm/core';
import UserModel from '../users.ts';
import Community from './community.ts';
import FullReview from './fullReview.ts';
import Group from './group.ts';
import Persona from './persona.ts';
import RapidReview from './rapidReview.ts';

@Entity()
export default class User {
  [EntityRepositoryType]: UserModel;

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
  username!: string;

  @Property()
  name!: string;

  @Property()
  @Unique()
  email!: string;

  @Property({ hidden: true })
  orcid!: string;

  @ManyToMany(() => Group, group => group.members)
  groups = new Collection<Group>(this);

  @ManyToMany(() => Community, community => community.members)
  communities = new Collection<Community>(this);

  @ManyToMany()
  communities = new Collection<Community>(this);

  @OneToMany()
  personas = new Collection<Persona>(this);

  @OneToMany()
  rapidReviews = new Collection<RapidReview>(this);

  @ManyToMany()
  fullReviews = new Collection<FullReview>(this);

  constructor(username: string, email: string, orcid: string) {
    this.username = username;
    this.email = email;
    this.orcid = orcid;
  }
}
