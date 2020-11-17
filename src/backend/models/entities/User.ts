import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { UserModel } from '../users';
import { BaseEntity } from './BaseEntity';
import { Community } from './Community';
import { Group } from './Group';
import { Persona } from './Persona';

@Entity()
export class User extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: UserModel;

  @Property()
  @Unique()
  username!: string;

  @Property()
  name!: string;

  @Fixture(faker => faker.internet.email())
  @Property()
  @Unique()
  email!: string;

  @Property()
  orcid!: string;

  @ManyToMany({ entity: () => Group, mappedBy: 'members' })
  groups: Collection<Group> = new Collection<Group>(this);

  @ManyToMany({ entity: () => Community, mappedBy: 'members' })
  communities: Collection<Community> = new Collection<Community>(this);

  @OneToMany({ entity: () => Persona, mappedBy: 'identity' })
  personas: Collection<Persona> = new Collection<Persona>(this);

  constructor(username: string, email: string, orcid: string) {
    super();
    this.username = username;
    this.email = email;
    this.orcid = orcid;
  }
}
