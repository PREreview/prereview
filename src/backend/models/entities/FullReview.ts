import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { FullReviewModel } from '../fullReviews';
import { BaseEntity } from './BaseEntity';
import { FullReviewDraft } from './FullReviewDraft';
import { Persona } from './Persona';
import { Preprint } from './Preprint';

@Entity()
export class FullReview extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: FullReviewModel;

  //eslint-disable-next-line
  @Property()
  published: boolean = false;

  //eslint-disable-next-line
  @Fixture({ get: () => "10.1101/19001834", optional: true })
  @Property()
  doi?: string = '10.1101/19001834';

  @OneToMany({ entity: () => FullReviewDraft, mappedBy: 'parent' })
  drafts: Collection<FullReviewDraft> = new Collection<FullReviewDraft>(this);

  @ManyToMany({ entity: () => Persona, mappedBy: 'fullReviews', owner: true })
  authors: Collection<Persona> = new Collection<Persona>(this);

  @ManyToOne({ entity: () => Preprint })
  preprint!: Preprint;

  constructor(doi: string, published = false) {
    super();
    this.doi = doi;
    this.published = published;
  }
}
