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
import Persona from './persona';
import Preprint from './preprint';

@Entity()
export class FullReviewDraft {

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @ManyToOne()
  parent!: FullReview;

  @Property()
  title!: string;

  @Property()
  contents!: string;

  constructor(title: string, contents: string) {
    this.title = title;
    this.contents = contents;
  }
}

@Entity()
export default class FullReview {
  [EntityRepositoryType]?: FullReviewModel;

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
