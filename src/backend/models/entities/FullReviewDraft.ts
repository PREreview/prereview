import {
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { FullReviewDraftModel } from '../fullReviewDrafts';
import { BaseEntity } from './BaseEntity';
import { FullReview } from './FullReview';

@Entity()
@Index({ properties: ['parent'] })
export class FullReviewDraft extends BaseEntity {
  [EntityRepositoryType]: FullReviewDraftModel;

  @ManyToOne({ entity: () => FullReview })
  parent!: FullReview;

  @Property({ columnType: 'text' })
  contents!: string;

  constructor(parent: FullReview, contents: string) {
    super();
    this.parent = parent;
    this.contents = contents;
  }
}
