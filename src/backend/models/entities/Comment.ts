import { EntitySchema } from '@mikro-orm/core';
import { CommentModel } from '../comments';
import { BaseEntity } from './BaseEntity';
import { FullReview } from './FullReview';
import { Persona } from './Persona';

export class Comment extends BaseEntity {
  contents!: string;
  isPublished = false;
  isFlagged = false;
  author!: Persona;
  parent!: FullReview;

  constructor(contents: string, author: Persona, parent: FullReview) {
    super();
    this.contents = contents;
    this.author = author;
    this.parent = parent;
  }
}

export const commentSchema = new EntitySchema<Comment, BaseEntity>({
  class: Comment,
  customRepository: () => CommentModel,
  indexes: [{ properties: 'author' }, { properties: 'parent' }],
  properties: {
    contents: { type: 'string', columnType: 'text' },
    isPublished: { type: 'boolean' },
    isFlagged: { type: 'boolean' },
    author: { reference: 'm:1', entity: () => Persona },
    parent: { reference: 'm:1', entity: () => FullReview },
  },
});
