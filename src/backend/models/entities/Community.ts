import {
  Collection,
  Entity,
  EntityRepositoryType,
  Index,
  ManyToMany,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { CommunityModel } from '../communities';
import { BaseEntity } from './BaseEntity';
import { Event } from './Event';
import { Persona } from './Persona';
import { Preprint } from './Preprint';
import { Tag } from './Tag';
import { Template } from './Template';
import { User } from './User';

@Entity()
@Index({ properties: ['members'] })
@Index({ properties: ['owners'] })
@Index({ properties: ['preprints'] })
@Index({ properties: ['events'] })
@Index({ properties: ['tags'] })
@Index({ properties: ['templates'] })
export class Community extends BaseEntity {
  [EntityRepositoryType]?: CommunityModel;

  @Fixture(faker => `${faker.commerce.color()} ${faker.random.word()}`)
  @Property()
  @Unique()
  name!: string;

  @Fixture(faker => `${faker.commerce.color()}-${faker.random.word()}`)
  @Property()
  @Unique()
  slug!: string;

  @Fixture(faker => faker.lorem.sentences())
  @Property({ columnType: 'text', nullable: true })
  description?: string;

  @Fixture(faker => faker.image.abstract())
  @Property({ nullable: true })
  banner?: Buffer;

  @Fixture(faker => faker.image.abstract())
  @Property({ nullable: true })
  logo?: Buffer;

  @Fixture(faker => faker.internet.userName())
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
