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
export class Community extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: CommunityModel;

  @Fixture(faker => `${faker.commerce.color()} ${faker.random.word()}`)
  @Property()
  @Unique()
  name!: string;

  @Fixture(faker => `${faker.commerce.color()}-${faker.random.word()}`)
  @Property()
  @Unique()
  slug!: string;

  //@Fixture({ get: faker => faker.lorem.paragraph(), optional: true })
  @Fixture(faker => faker.lorem.sentences())
  @Property({ columnType: 'text', nullable: true })
  description?: string;

  //@Fixture({ get: faker => faker.image.abstract(), optional: true })
  @Fixture(faker => faker.image.abstract())
  @Property({ nullable: true })
  banner?: Buffer;

  @Fixture(faker => faker.image.abstract())
  @Property({ nullable: true })
  logo?: Buffer;

  @ManyToMany({ entity: () => Persona, inversedBy: 'communities' })
  @Index()
  members: Collection<Persona> = new Collection<Persona>(this);

  @ManyToMany({ entity: () => User, inversedBy: 'owned' })
  @Index()
  owners: Collection<User> = new Collection<User>(this);

  @ManyToMany({ entity: () => Preprint, inversedBy: 'communities' })
  @Index()
  preprints: Collection<Preprint> = new Collection<Preprint>(this);

  @OneToMany({ entity: () => Event, mappedBy: 'community' })
  @Index()
  events: Collection<Event> = new Collection<Event>(this);

  @ManyToMany({ entity: () => Tag, inversedBy: 'communities' })
  @Index()
  tags: Collection<Tag> = new Collection<Tag>(this);

  @OneToMany({ entity: () => Template, mappedBy: 'community' })
  @Index()
  templates: Collection<Template> = new Collection<Template>(this);

  constructor(name: string, description?: string, logo?: Buffer) {
    super();
    this.name = name;
    this.description = description;
    this.logo = logo;
  }
}
