import {
  Entity,
  EntityRepositoryType,
  Index,
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
  @Index()
  parent!: FullReview;

  @Fixture(faker => faker.lorem.paragraph())
  @Property({ columnType: 'text' })
  contents!: string;

  constructor(parent: FullReview, contents: string) {
    super();
    this.parent = parent;
    this.contents = contents;
  }
}
