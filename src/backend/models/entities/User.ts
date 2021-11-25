import { Collection, EntitySchema } from '@mikro-orm/core';
import { UserModel } from '../users';
import { BaseEntity } from './BaseEntity';
import { Community } from './Community';
import { Contact } from './Contact';
import { Group } from './Group';
import { Persona } from './Persona';
import { Work } from './Work';
import { Key } from './Key';

export class User extends BaseEntity {
  orcid!: string;
  defaultPersona?: Persona;
  isPrivate?: boolean;
  groups: Collection<Group> = new Collection<Group>(this);
  owned: Collection<Community> = new Collection<Community>(this);
  personas: Collection<Persona> = new Collection<Persona>(this);
  contacts: Collection<Contact> = new Collection<Contact>(this);
  works: Collection<Work> = new Collection<Work>(this);
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

export const userSchema = new EntitySchema<User, BaseEntity>({
  class: User,
  customRepository: () => UserModel,
  properties: {
    orcid: { type: 'string', unique: true },
    defaultPersona: { reference: '1:1', entity: () => Persona, nullable: true },
    isPrivate: { type: 'boolean' },
    groups: {
      reference: 'm:n',
      entity: () => Group,
      mappedBy: (group) => group.members,
    },
    owned: {
      reference: 'm:n',
      entity: () => Community,
      mappedBy: (community) => community.owners,
    },
    personas: {
      reference: '1:m',
      entity: () => Persona,
      mappedBy: (persona) => persona.identity,
    },
    contacts: {
      reference: '1:m',
      entity: () => Contact,
      mappedBy: (contact) => contact.identity,
    },
    works: {
      reference: '1:m',
      entity: () => Work,
      mappedBy: (work) => work.author,
    },
    keys: { reference: '1:m', entity: () => Key, mappedBy: (key) => key.owner },
  },
});
