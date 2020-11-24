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
import { createRandomOrcid } from '../../../common/utils/orcid.js';

@Entity()
export class User extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: UserModel;

  @Fixture(faker => faker.name.findName())
  @Property({ nullable: true })
  name?: string;

  @Fixture(faker => faker.internet.email())
  @Property({ nullable: true })
  @Unique()
  email?: string;

  @Fixture(() => createRandomOrcid())
  @Property()
  orcid!: string;

  @ManyToMany({ entity: () => Group, mappedBy: 'members' })
  groups: Collection<Group> = new Collection<Group>(this);

  @ManyToMany({ entity: () => Community, mappedBy: 'members' })
  communities: Collection<Community> = new Collection<Community>(this);

  @OneToMany({ entity: () => Persona, mappedBy: 'identity' })
  personas: Collection<Persona> = new Collection<Persona>(this);

  constructor(orcid: string, email?: string) {
    super();
    this.email = email;
    this.orcid = orcid;
  }
}
