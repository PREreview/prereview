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
import Community from './Community';
import FullReview from './FullReview';
import Group from './Group';
import Persona from './Persona';
import RapidReview from './RapidReview';

@Entity()
export class User {
  [EntityRepositoryType]: UserModel;

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

  constructor(username: string, email: string, orcid: string) {
    this.username = username;
    this.email = email;
    this.orcid = orcid;
  }
}
