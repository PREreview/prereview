import { Collection, EntitySchema } from '@mikro-orm/core';
import { FullReviewModel } from '../fullReviews';
import { BaseEntity } from './BaseEntity';
import { Comment } from './Comment';
import { FullReviewDraft } from './FullReviewDraft';
import { Persona } from './Persona';
import { Preprint } from './Preprint';
import { Statement } from './Statement';

export class FullReview extends BaseEntity {
  isPublished = false;
  isFlagged = false;
  doi?: string;
  drafts: Collection<FullReviewDraft> = new Collection<FullReviewDraft>(this);
  mentorInvites: Collection<Persona> = new Collection<Persona>(this);
  mentors: Collection<Persona> = new Collection<Persona>(this);
  authorInvites: Collection<Persona> = new Collection<Persona>(this);
  authors: Collection<Persona> = new Collection<Persona>(this);
  preprint!: Preprint;
  comments: Collection<Comment> = new Collection<Comment>(this);
  statements: Collection<Statement> = new Collection<Statement>(this);

  constructor(preprint: Preprint, isPublished = false, doi?: string) {
    super();
    this.preprint = preprint;
    this.isPublished = isPublished;
    this.doi = doi;
  }
}

export const fullReviewSchema = new EntitySchema<FullReview, BaseEntity>({
  class: FullReview,
  customRepository: () => FullReviewModel,
  properties: {
    isPublished: { type: 'boolean' },
    isFlagged: { type: 'boolean' },
    doi: { type: 'string', nullable: true, unique: true },
    drafts: {
      reference: '1:m',
      entity: () => FullReviewDraft,
      mappedBy: (draft) => draft.parent,
    },
    mentorInvites: {
      reference: 'm:n',
      entity: () => Persona,
      inversedBy: (persona) => persona.invitedToMentor,
    },
    mentors: {
      reference: 'm:n',
      entity: () => Persona,
      inversedBy: (persona) => persona.mentoring,
    },
    authorInvites: {
      reference: 'm:n',
      entity: () => Persona,
      inversedBy: (persona) => persona.invitedToAuthor,
    },
    authors: {
      reference: 'm:n',
      entity: () => Persona,
      inversedBy: (persona) => persona.fullReviews,
    },
    preprint: { reference: 'm:1', entity: () => Preprint },
    comments: {
      reference: '1:m',
      entity: () => Comment,
      mappedBy: (comment) => comment.parent,
    },
    statements: {
      reference: '1:m',
      entity: () => Statement,
      mappedBy: (statement) => statement.parent,
    },
  },
});
