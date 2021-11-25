import { Collection, EntitySchema } from '@mikro-orm/core';
import { CommunityModel } from '../communities';
import { BaseEntity } from './BaseEntity';
import { Event } from './Event';
import { Persona } from './Persona';
import { Preprint } from './Preprint';
import { Tag } from './Tag';
import { Template } from './Template';
import { User } from './User';

export class Community extends BaseEntity {
  name!: string;
  slug!: string;
  description?: string;
  banner?: Buffer;
  logo?: Buffer;
  twitter?: string;
  members: Collection<Persona> = new Collection<Persona>(this);
  owners: Collection<User> = new Collection<User>(this);
  preprints: Collection<Preprint> = new Collection<Preprint>(this);
  events: Collection<Event> = new Collection<Event>(this);
  tags: Collection<Tag> = new Collection<Tag>(this);
  templates: Collection<Template> = new Collection<Template>(this);

  constructor(
    name: string,
    description?: string,
    logo?: Buffer,
    twitter?: string,
  ) {
    super();
    this.name = name;
    this.description = description;
    this.logo = logo;
    this.twitter = twitter;
  }
}

export const communitySchema = new EntitySchema<Community, BaseEntity>({
  class: Community,
  customRepository: () => CommunityModel,
  properties: {
    name: { type: 'string', unique: true },
    slug: { type: 'string', unique: true },
    description: { type: 'string', columnType: 'text', nullable: true },
    banner: { type: 'Buffer', nullable: true },
    logo: { type: 'Buffer', nullable: true },
    twitter: { type: 'string', nullable: true },
    members: {
      reference: 'm:n',
      entity: () => Persona,
      inversedBy: (persona) => persona.communities,
    },
    owners: {
      reference: 'm:n',
      entity: () => User,
      inversedBy: (user) => user.owned,
    },
    preprints: {
      reference: 'm:n',
      entity: () => Preprint,
      inversedBy: (preprint) => preprint.communities,
    },
    events: {
      reference: '1:m',
      entity: () => Event,
      mappedBy: (event) => event.community,
    },
    tags: {
      reference: 'm:n',
      entity: () => Tag,
      inversedBy: (tag) => tag.communities,
    },
    templates: {
      reference: '1:m',
      entity: () => Template,
      mappedBy: (template) => template.community,
    },
  },
});
