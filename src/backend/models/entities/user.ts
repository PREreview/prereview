import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { UserModel } from '../users';
import Community from './community';
import FullReview from './fullReview';
import Group from './group';
import Persona from './persona';
import RapidReview from './rapidReview';

@Entity()
export default class User {
  [EntityRepositoryType]?: UserModel;

  @PrimaryKey()
  id!: number;

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

  @OneToMany('Persona', 'identity')
  personas = new Collection<Persona>(this);

  @OneToMany('RapidReview', 'author')
  rapidReviews = new Collection<RapidReview>(this);

  @ManyToMany()
  fullReviews = new Collection<FullReview>(this);

  constructor(username: string, email: string, orcid: string) {
    this.username = username;
    this.email = email;
    this.orcid = orcid;
  }
}
