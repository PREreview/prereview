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
import { Badge } from './Badge';
import { Community } from './Community';
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

  @ManyToOne({ entity: () => User, nullable: true })
  identity?: User;

  @Fixture(() => false)
  @Property()
  isAnonymous!: boolean;

  //eslint-disable-next-line
  @Fixture(() => false)
  @Property()
  isLocked: boolean = false;

  //eslint-disable-next-line
  @Fixture(() => false)
  @Property()
  isFlagged: boolean = false;

  @Fixture(faker => faker.lorem.paragraph())
  @Property({ columnType: 'text', nullable: true })
  bio?: string;

  @Fixture(() => 'wT17FWtRIPTQGkGhi0UMSYZhVbQyfms1')
  @Property({ nullable: true })
  avatar?: Buffer;

  @Fixture(() => 'image/jpeg')
  @Property({ nullable: true })
  avatar_encoding?: string;

  @ManyToMany({ entity: () => Community, mappedBy: 'members' })
  communities: Collection<Community> = new Collection<Community>(this);

  @OneToMany({ entity: () => RapidReview, mappedBy: 'author' })
  rapidReviews: Collection<RapidReview> = new Collection<RapidReview>(this);

  @ManyToMany({ entity: () => FullReview, mappedBy: 'authors' })
  fullReviews: Collection<FullReview> = new Collection<FullReview>(this);

  @ManyToMany({ entity: () => FullReview, mappedBy: 'authorInvites' })
  invitedToAuthor: Collection<FullReview> = new Collection<FullReview>(this);

  @ManyToMany({ entity: () => FullReview, mappedBy: 'mentors' })
  mentoring: Collection<FullReview> = new Collection<FullReview>(this);

  @ManyToMany({ entity: () => FullReview, mappedBy: 'mentorInvites' })
  invitedToMentor: Collection<FullReview> = new Collection<FullReview>(this);

  @OneToMany({ entity: () => Request, mappedBy: 'author' })
  requests: Collection<Request> = new Collection<Request>(this);

  @ManyToMany({ entity: () => Badge, mappedBy: 'personas' })
  badges: Collection<Badge> = new Collection<Badge>(this);

  constructor(
    name: string,
    identity: User,
    isAnonymous = false,
    isFlagged = false,
    isLocked = false,
    bio: string,
    avatar?: Buffer,
    avatar_encoding?: string,
  ) {
    super();
    this.name = name;
    this.identity = identity;
    this.isAnonymous = isAnonymous;
    this.isFlagged = isFlagged;
    this.isLocked = isLocked;
    this.bio = bio;
    this.avatar = avatar;
    this.avatar_encoding = avatar_encoding;
  }
}
