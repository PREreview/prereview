import { EntitySchema } from '@mikro-orm/core';
import { StatementModel } from '../statements';
import { BaseEntity } from './BaseEntity';
import { FullReview } from './FullReview';
import { Persona } from './Persona';

export class Statement extends BaseEntity {
  contents!: string;
  isFlagged: boolean = false;
  author!: Persona;
  parent!: FullReview;

  constructor(contents: string, author: Persona, parent: FullReview) {
    super();
    this.contents = contents;
    this.author = author;
    this.parent = parent;
  }
}

export const statementSchema = new EntitySchema<Statement, BaseEntity>({
  class: Statement,
  customRepository: () => StatementModel,
  indexes: [{ properties: ['author'] }, { properties: ['parent'] }],
  properties: {
    contents: { type: 'string', columnType: 'text' },
    isFlagged: { type: 'boolean' },
    author: { reference: 'm:1', entity: () => Persona },
    parent: { reference: 'm:1', entity: () => FullReview },
  },
});
