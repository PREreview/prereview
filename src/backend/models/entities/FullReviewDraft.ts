import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { FullReviewDraftModel } from '../fullReviewDrafts';
import { BaseEntity } from './BaseEntity';
import { FullReview } from './FullReview';

@Entity()
export class FullReviewDraft extends BaseEntity {
  [EntityRepositoryType]: FullReviewDraftModel;

  @ManyToOne({ entity: () => FullReview })
  parent!: FullReview;

  @Property()
  title!: string;

  @Property()
  contents!: string;

  constructor(title: string, contents: string) {
    super();
    this.title = title;
    this.contents = contents;
  }
}
