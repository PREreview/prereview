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
import { PersonaModel } from '../personas';
import { BaseEntity } from './BaseEntity';
import { Badge } from './Badge';
import { Community } from './Community';
import { Expertise } from './Expertise';
import { FullReview } from './FullReview';
import { RapidReview } from './RapidReview';
import { Request } from './Request';
import { User } from './User';

@Entity()
@Index({ name: 'persona_trgm', properties: ['name', 'bio'] })
export class Persona extends BaseEntity {
  [EntityRepositoryType]?: PersonaModel;

  @Property()
  name!: string;

  @ManyToOne({ entity: () => User, nullable: true, hidden: true })
  identity?: User;

  @Property()
  isAnonymous!: boolean;

  @Property()
  isLocked: boolean = false;

  @Property()
  isFlagged: boolean = false;

  @Property({ columnType: 'text', nullable: true })
  bio?: string;

  @Property({ nullable: true })
  avatar?: Buffer;

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

  @ManyToMany({ entity: () => Expertise, mappedBy: 'personas' })
  expertises: Collection<Expertise> = new Collection<Expertise>(this);

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
