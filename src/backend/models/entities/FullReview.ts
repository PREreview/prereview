import {
  Collection,
  Entity,
  EntityRepositoryType,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { FullReviewModel } from '../fullReviews';
import { BaseEntity } from './BaseEntity';
import { Comment } from './Comment';
import { FullReviewDraft } from './FullReviewDraft';
import { Persona } from './Persona';
import { Preprint } from './Preprint';
import { Statement } from './Statement';
import { createRandomDoi } from '../../utils/ids';

@Entity()
@Index({ properties: ['drafts'] })
@Index({ properties: ['mentorInvites'] })
@Index({ properties: ['mentors'] })
@Index({ properties: ['authorInvites'] })
@Index({ properties: ['authors'] })
@Index({ properties: ['preprint'] })
@Index({ properties: ['comments'] })
@Index({ properties: ['statements'] })
export class FullReview extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: FullReviewModel;

  //eslint-disable-next-line
  @Property()
  isPublished: boolean = false;

  //eslint-disable-next-line
  @Property()
  isFlagged: boolean = false;

  //eslint-disable-next-line
  @Fixture({ get: () => createRandomDoi(), optional: true })
  @Property({ nullable: true })
  @Unique()
  doi?: string;

  @OneToMany({ entity: () => FullReviewDraft, mappedBy: 'parent' })
  drafts: Collection<FullReviewDraft> = new Collection<FullReviewDraft>(this);

  @ManyToMany({ entity: () => Persona, inversedBy: 'invitedToMentor' })
  mentorInvites: Collection<Persona> = new Collection<Persona>(this);

  @ManyToMany({ entity: () => Persona, inversedBy: 'mentoring' })
  mentors: Collection<Persona> = new Collection<Persona>(this);

  @ManyToMany({ entity: () => Persona, inversedBy: 'invitedToAuthor' })
  authorInvites: Collection<Persona> = new Collection<Persona>(this);

  @ManyToMany({ entity: () => Persona, inversedBy: 'fullReviews' })
  authors: Collection<Persona> = new Collection<Persona>(this);

  @ManyToOne({ entity: () => Preprint })
  preprint!: Preprint;

  @OneToMany({ entity: () => Comment, mappedBy: 'parent' })
  comments: Collection<Comment> = new Collection<Comment>(this);

  @OneToMany({ entity: () => Comment, mappedBy: 'parent' })
  statements: Collection<Statement> = new Collection<Statement>(this);

  constructor(preprint: Preprint, isPublished = false, doi?: string) {
    super();
    this.preprint = preprint;
    this.isPublished = isPublished;
    this.doi = doi;
  }
}
