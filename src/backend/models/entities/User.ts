import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  OneToMany,
  OneToOne,
  Property,
  Unique,
} from '@mikro-orm/core';
import { UserModel } from '../users';
import { BaseEntity } from './BaseEntity';
import { Community } from './Community';
import { Contact } from './Contact';
import { Group } from './Group';
import { Persona } from './Persona';
import { Work } from './Work';
import { Key } from './Key';

@Entity()
export class User extends BaseEntity {
  [EntityRepositoryType]?: UserModel;

  @Unique()
  @Property()
  orcid!: string;

  @OneToOne({ entity: () => Persona, nullable: true })
  defaultPersona?: Persona;

  @Property()
  isPrivate?: boolean;

  @ManyToMany({ entity: () => Group, mappedBy: 'members' })
  groups: Collection<Group> = new Collection<Group>(this);

  @ManyToMany({ entity: () => Community, mappedBy: 'owners' })
  owned: Collection<Community> = new Collection<Community>(this);

  @OneToMany({ entity: () => Persona, mappedBy: 'identity' })
  personas: Collection<Persona> = new Collection<Persona>(this);

  @OneToMany({ entity: () => Contact, mappedBy: 'identity' })
  contacts: Collection<Contact> = new Collection<Contact>(this);

  @OneToMany({ entity: () => Work, mappedBy: 'author' })
  works: Collection<Work> = new Collection<Work>(this);

  @OneToMany({ entity: () => Key, mappedBy: 'owner' })
  keys: Collection<Key> = new Collection<Key>(this);

  constructor(orcid: string, isPrivate = false, defaultPersona?: Persona) {
    super();
    this.orcid = orcid;
    this.isPrivate = isPrivate;
    if (defaultPersona) {
      this.defaultPersona = defaultPersona;
    }
  }
}
