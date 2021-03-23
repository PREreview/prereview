import {
  Collection,
  Entity,
  EntityRepositoryType,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Property,
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
  name!: string;

  @ManyToOne({ entity: () => User, nullable: true, hidden: true })
  @Index()
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
  @Index()
  communities: Collection<Community> = new Collection<Community>(this);

  @OneToMany({ entity: () => RapidReview, mappedBy: 'author' })
  @Index()
  rapidReviews: Collection<RapidReview> = new Collection<RapidReview>(this);

  @ManyToMany({ entity: () => FullReview, mappedBy: 'authors' })
  @Index()
  fullReviews: Collection<FullReview> = new Collection<FullReview>(this);

  @ManyToMany({ entity: () => FullReview, mappedBy: 'authorInvites' })
  @Index()
  invitedToAuthor: Collection<FullReview> = new Collection<FullReview>(this);

  @ManyToMany({ entity: () => FullReview, mappedBy: 'mentors' })
  @Index()
  mentoring: Collection<FullReview> = new Collection<FullReview>(this);

  @ManyToMany({ entity: () => FullReview, mappedBy: 'mentorInvites' })
  @Index()
  invitedToMentor: Collection<FullReview> = new Collection<FullReview>(this);

  @OneToMany({ entity: () => Request, mappedBy: 'author' })
  @Index()
  requests: Collection<Request> = new Collection<Request>(this);

  @ManyToMany({ entity: () => Badge, mappedBy: 'personas' })
  @Index()
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
