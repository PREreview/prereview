import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { CommunityModel } from '../communities';
import { BaseEntity } from './BaseEntity';
import { Event } from './Event';
import { Persona } from './Persona';
import { Preprint } from './Preprint';
import { Tag } from './Tag';
import { Template } from './Template';
import { User } from './User';

@Entity()
export class Community extends BaseEntity {
  [EntityRepositoryType]?: CommunityModel;

  @Property()
  @Unique()
  name!: string;

  @Property()
  @Unique()
  slug!: string;

  @Property({ columnType: 'text', nullable: true })
  description?: string;

  @Property({ nullable: true })
  banner?: Buffer;

  @Property({ nullable: true })
  logo?: Buffer;

  @Property({ nullable: true })
  twitter?: string;

  @ManyToMany({ entity: () => Persona, inversedBy: 'communities' })
  members: Collection<Persona> = new Collection<Persona>(this);

  @ManyToMany({ entity: () => User, inversedBy: 'owned' })
  owners: Collection<User> = new Collection<User>(this);

  @ManyToMany({ entity: () => Preprint, inversedBy: 'communities' })
  preprints: Collection<Preprint> = new Collection<Preprint>(this);

  @OneToMany({ entity: () => Event, mappedBy: 'community' })
  events: Collection<Event> = new Collection<Event>(this);

  @ManyToMany({ entity: () => Tag, inversedBy: 'communities' })
  tags: Collection<Tag> = new Collection<Tag>(this);

  @OneToMany({ entity: () => Template, mappedBy: 'community' })
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
