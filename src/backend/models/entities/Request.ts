import { EntitySchema } from '@mikro-orm/core';
import { RequestModel } from '../requests';
import { BaseEntity } from './BaseEntity';
import { Persona } from './Persona';
import { Preprint } from './Preprint';

export class Request extends BaseEntity {
  author!: Persona;
  preprint!: Preprint;
  isPreprintAuthor = false;

  constructor(author: Persona, preprint: Preprint, isPreprintAuthor = false) {
    super();
    this.author = author;
    this.preprint = preprint;
    this.isPreprintAuthor = isPreprintAuthor;
  }
}

export const requestSchema = new EntitySchema<Request, BaseEntity>({
  class: Request,
  customRepository: () => RequestModel,
  indexes: [{ properties: ['author'] }, { properties: ['preprint'] }],
  properties: {
    author: { reference: 'm:1', entity: () => Persona },
    preprint: { reference: 'm:1', entity: () => Preprint },
    isPreprintAuthor: { type: 'boolean' },
  },
});
