import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { FullReviewModel } from '../fullReviews';
import FullReviewDraft from './FullReviewDraft';
import Persona from './Persona';
import Preprint from './Preprint';

@Entity()
export class FullReview {
  [EntityRepositoryType]: FullReviewModel;

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  published = false;

  @Property()
  doi = '';

  @OneToMany('FullReviewDraft', 'parent')
  drafts = new Collection<FullReviewDraft>(this);

  @ManyToMany()
  authors = new Collection<Persona>(this);

  @ManyToOne()
  preprint!: Preprint;

  constructor(doi: string, published = false) {
    this.doi = doi;
    this.published = published;
  }
}
