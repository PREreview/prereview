import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { FullReviewDraftModel } from '../fullReviewDrafts';
import FullReview from './fullReview';

@Entity()
export default class FullReviewDraft {
  [EntityRepositoryType]: FullReviewDraftModel;

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
