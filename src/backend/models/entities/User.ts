import {
  Collection,
  Entity,
  EntityRepositoryType,
  Index,
  ManyToMany,
  OneToMany,
  OneToOne,
  Property,
  Unique,
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
  @Unique()
  @Property()
  orcid!: string;

  @OneToOne({ entity: () => Persona, nullable: true })
  @Index()
  defaultPersona?: Persona;

  @Fixture(() => false)
  @Property()
  isPrivate?: boolean;

  @ManyToMany({ entity: () => Group, mappedBy: 'members' })
  @Index()
  groups: Collection<Group> = new Collection<Group>(this);

  @ManyToMany({ entity: () => Community, mappedBy: 'owners' })
  @Index()
  owned: Collection<Community> = new Collection<Community>(this);

  @OneToMany({ entity: () => Persona, mappedBy: 'identity' })
  @Index()
  personas: Collection<Persona> = new Collection<Persona>(this);

  @OneToMany({ entity: () => Contact, mappedBy: 'identity' })
  @Index()
  contacts: Collection<Contact> = new Collection<Contact>(this);

  @OneToMany({ entity: () => Work, mappedBy: 'author' })
  @Index()
  works: Collection<Work> = new Collection<Work>(this);

  constructor(orcid: string, isPrivate = false, defaultPersona?: Persona) {
    super();
    this.orcid = orcid;
    this.isPrivate = isPrivate;
    if (defaultPersona) {
      this.defaultPersona = defaultPersona;
    }
  }
}
