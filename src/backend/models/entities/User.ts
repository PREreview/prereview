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

  @Property({ nullable: true })
  @Unique()
  username?: string;

  @Property({ nullable: true })
  name?: string;

  @Fixture(faker => faker.internet.email())
  @Property({ nullable: true })
  @Unique()
  email?: string;

  @Property()
  orcid!: string;

  @ManyToMany({ entity: () => Group, mappedBy: 'members' })
  groups: Collection<Group> = new Collection<Group>(this);

  @ManyToMany({ entity: () => Community, mappedBy: 'members' })
  communities: Collection<Community> = new Collection<Community>(this);

  @OneToMany({ entity: () => Persona, mappedBy: 'identity' })
  personas: Collection<Persona> = new Collection<Persona>(this);

  constructor(orcid: string, username?: string, email?: string) {
    super();
    this.username = username;
    this.email = email;
    this.orcid = orcid;
  }
}
