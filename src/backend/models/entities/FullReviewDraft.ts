import { EntitySchema } from '@mikro-orm/core';
import { FullReviewDraftModel } from '../fullReviewDrafts';
import { BaseEntity } from './BaseEntity';
import { FullReview } from './FullReview';

export class FullReviewDraft extends BaseEntity {
  parent!: FullReview;
  contents!: string;

  constructor(parent: FullReview, contents: string) {
    super();
    this.parent = parent;
    this.contents = contents;
  }
}

export const fullReviewDraftSchema = new EntitySchema<
  FullReviewDraft,
  BaseEntity
>({
  class: FullReviewDraft,
  customRepository: () => FullReviewDraftModel,
  indexes: [{ properties: ['parent'] }],
  properties: {
    parent: { reference: 'm:1', entity: () => FullReview },
    contents: { type: 'string', columnType: 'text' },
  },
});
