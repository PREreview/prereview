import {
  Entity,
  EntityRepositoryType,
  OneToMany,
  PrimaryKey,
  Property,
  SerializedPrimaryKey,
} from '@mikro-orm/core';
import FullReviewModel from '../fullReviews.ts';
import Persona from './persona.ts';
import Preprint from './preprint.ts';

@Entity()
export class FullReviewDraft {
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

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
  [EntityRepositoryType]: FullReviewModel;

  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  published = false;

  @Property()
  doi = '';

  @OneToMany()
  drafts = new Collection<FullReviewDrafts>(this);

  @ManyToMany()
  authors = new Collection<Persona>(this);

  @ManyToOne()
  preprint!: Preprint;

  constructor(doi: string, published = false) {
    this.doi = doi;
    this.published = published;
  }
}
