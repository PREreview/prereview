import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  OneToMany,
  OneToOne,
  Property,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { UserModel } from '../users';
import { BaseEntity } from './BaseEntity';
import { Community } from './Community';
import { Contact } from './Contact';
import { Group } from './Group';
import { Persona } from './Persona';
import { Work } from './Work';
import { createRandomOrcid } from '../../../common/utils/orcid.js';

@Entity()
export class User extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: UserModel;

  @Fixture(() => createRandomOrcid())
  @Property()
  orcid!: string;

  @Fixture(faker => faker.name.findName())
  @Property({ nullable: true })
  name?: string;

  @OneToOne({ entity: () => Persona })
  defaultPersona?: Persona;

  @Property()
  isPrivate = false;

  @ManyToMany({ entity: () => Group, mappedBy: 'members' })
  groups: Collection<Group> = new Collection<Group>(this);

  @ManyToMany({ entity: () => Community, mappedBy: 'members' })
  communities: Collection<Community> = new Collection<Community>(this);

  @OneToMany({ entity: () => Persona, mappedBy: 'identity' })
  personas: Collection<Persona> = new Collection<Persona>(this);

  @OneToMany({ entity: () => Contact, mappedBy: 'identity' })
  contacts: Collection<Contact> = new Collection<Contact>(this);

  @OneToMany({ entity: () => Work, mappedBy: 'author' })
  works: Collection<Work> = new Collection<Work>(this);

  constructor(
    orcid: string,
    isPrivate = false,
    name?: string,
    defaultPersona?: Persona,
  ) {
    super();
    this.orcid = orcid;
    this.isPrivate = isPrivate;
    this.name = name;
    this.defaultPersona = defaultPersona;
  }
}
