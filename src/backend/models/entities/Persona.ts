import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { PersonaModel } from '../personas';
import { BaseEntity } from './BaseEntity';
import { FullReview } from './FullReview';
import { RapidReview } from './RapidReview';
import { Request } from './Request';
import { User } from './User';

@Entity()
export class Persona extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: PersonaModel;

  @Fixture(faker => faker.name.findName())
  @Property()
  @Unique()
  name!: string;

  @ManyToOne({ entity: () => User })
  identity!: User;

  @Property()
  isActive = true;

  @Property()
  isAnonymous = false;

  @Fixture({ get: faker => faker.lorem.paragraph(), optional: true })
  @Property({ columnType: 'text', nullable: true })
  bio?: string;

  @Fixture(faker => faker.image.avatar())
  @Property({ nullable: true })
  avatar?: Buffer;

  @OneToMany({ entity: () => RapidReview, mappedBy: 'author' })
  rapidReviews: Collection<RapidReview> = new Collection<RapidReview>(this);

  @ManyToMany({ entity: () => FullReview, mappedBy: 'authors' })
  fullReviews: Collection<FullReview> = new Collection<FullReview>(this);

  @OneToMany({ entity: () => Request, mappedBy: 'author' })
  requests: Collection<Request> = new Collection<Request>(this);

  constructor(
    name: string,
    identity: User,
    isAnonymous = false,
    bio: string,
    avatar?: Buffer,
  ) {
    super();
    this.name = name;
    this.identity = identity;
    this.isAnonymous = isAnonymous;
    this.bio = bio;
    this.avatar = avatar;
    this.isActive = true;
  }
}
