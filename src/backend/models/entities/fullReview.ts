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
import FullReviewDraft from './fullReviewDraft';
import Persona from './persona';
import Preprint from './preprint';

@Entity()
export default class FullReview {
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

  @ManyToMany('Persona', 'fullReviews', { owner: true })
  authors = new Collection<Persona>(this);

  @ManyToOne()
  preprint!: Preprint;

  constructor(doi: string, published = false) {
    this.doi = doi;
    this.published = published;
  }
}
