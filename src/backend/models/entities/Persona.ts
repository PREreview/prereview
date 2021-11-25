import { Collection, EntitySchema } from '@mikro-orm/core';
import { PersonaModel } from '../personas';
import { BaseEntity } from './BaseEntity';
import { Badge } from './Badge';
import { Community } from './Community';
import { Expertise } from './Expertise';
import { FullReview } from './FullReview';
import { RapidReview } from './RapidReview';
import { Request } from './Request';
import { User } from './User';

export class Persona extends BaseEntity {
  name!: string;
  identity?: User;
  isAnonymous!: boolean;
  isLocked: boolean = false;
  isFlagged: boolean = false;
  bio?: string;
  avatar?: Buffer;
  avatar_encoding?: string;
  communities: Collection<Community> = new Collection<Community>(this);
  rapidReviews: Collection<RapidReview> = new Collection<RapidReview>(this);
  fullReviews: Collection<FullReview> = new Collection<FullReview>(this);
  invitedToAuthor: Collection<FullReview> = new Collection<FullReview>(this);
  mentoring: Collection<FullReview> = new Collection<FullReview>(this);
  invitedToMentor: Collection<FullReview> = new Collection<FullReview>(this);
  requests: Collection<Request> = new Collection<Request>(this);
  badges: Collection<Badge> = new Collection<Badge>(this);
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

export const personaSchema = new EntitySchema<Persona, BaseEntity>({
  class: Persona,
  customRepository: () => PersonaModel,
  indexes: [{ name: 'persona_trgm', properties: ['name', 'bio'] }],
  properties: {
    name: { type: 'string' },
    identity: {
      reference: 'm:1',
      entity: () => User,
      nullable: true,
      hidden: true,
    },
    isAnonymous: { type: 'boolean' },
    isLocked: { type: 'boolean' },
    isFlagged: { type: 'boolean' },
    bio: { type: 'string', columnType: 'text', nullable: true },
    avatar: { type: 'Buffer', nullable: true },
    avatar_encoding: { type: 'string', nullable: true },
    communities: {
      reference: 'm:n',
      entity: () => Community,
      mappedBy: (community) => community.members,
    },
    rapidReviews: {
      reference: '1:m',
      entity: () => RapidReview,
      mappedBy: (rapidReview) => rapidReview.author,
    },
    fullReviews: {
      reference: 'm:n',
      entity: () => FullReview,
      mappedBy: (fullReview) => fullReview.authors,
    },
    invitedToAuthor: {
      reference: 'm:n',
      entity: () => FullReview,
      mappedBy: (fullReview) => fullReview.authorInvites,
    },
    mentoring: {
      reference: 'm:n',
      entity: () => FullReview,
      mappedBy: (fullReview) => fullReview.mentors,
    },
    invitedToMentor: {
      reference: 'm:n',
      entity: () => FullReview,
      mappedBy: (fullReview) => fullReview.mentorInvites,
    },
    requests: {
      reference: '1:m',
      entity: () => Request,
      mappedBy: (request) => request.author,
    },
    badges: {
      reference: 'm:n',
      entity: () => Badge,
      mappedBy: (badge) => badge.personas,
    },
    expertises: {
      reference: 'm:n',
      entity: () => Expertise,
      mappedBy: (expertise) => expertise.personas,
    },
  },
});
