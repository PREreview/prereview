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
import { FullReviewModel } from '../fullReviews';
import { BaseEntity } from './BaseEntity';
import { Comment } from './Comment';
import { FullReviewDraft } from './FullReviewDraft';
import { Persona } from './Persona';
import { Preprint } from './Preprint';
import { createRandomDoi } from '../../../common/utils/ids';

@Entity()
export class FullReview extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: FullReviewModel;

  //eslint-disable-next-line
  @Property()
  published: boolean = false;

  //eslint-disable-next-line
  @Fixture({ get: () => createRandomDoi(), optional: true })
  @Property({ nullable: true })
  @Unique()
  doi?: string;

  @OneToMany({ entity: () => FullReviewDraft, mappedBy: 'parent' })
  drafts: Collection<FullReviewDraft> = new Collection<FullReviewDraft>(this);

  @ManyToMany({ entity: () => Persona, inversedBy: 'fullReviews' })
  authors: Collection<Persona> = new Collection<Persona>(this);

  @ManyToOne({ entity: () => Preprint })
  preprint!: Preprint;

  @OneToMany({ entity: () => Comment, mappedBy: 'parent' })
  comments: Collection<Comment> = new Collection<Comment>(this);

  constructor(preprint: Preprint, published = false, doi?: string) {
    super();
    this.preprint = preprint;
    this.published = published;
    this.doi = doi;
  }
}
