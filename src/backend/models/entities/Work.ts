import { EntitySchema } from '@mikro-orm/core';
import { WorkModel } from '../works';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

export class Work extends BaseEntity {
  title?: string;
  author!: User;
  url?: string;
  type?: string;
  handle?: string;
  publicationDate?: Date;
  publisher?: string;

  constructor(
    title: string,
    author: User,
    url: string,
    type: string,
    handle: string,
    publicationDate: Date,
    publisher: string,
  ) {
    super();
    this.title = title;
    this.author = author;
    this.url = url;
    this.type = type;
    this.handle = handle;
    this.publicationDate = publicationDate;
    this.publisher = publisher;
  }
}

export const workSchema = new EntitySchema<Work, BaseEntity>({
  class: Work,
  customRepository: () => WorkModel,
  indexes: [{ properties: ['author'] }],
  properties: {
    title: { type: 'string', columnType: 'text', nullable: true },
    author: { reference: 'm:1', entity: () => User },
    url: { type: 'string', columnType: 'text', nullable: true },
    type: { type: 'string', nullable: true },
    handle: { type: 'string', nullable: true },
    publicationDate: { type: 'Date', nullable: true },
    publisher: { type: 'string', columnType: 'text', nullable: true },
  },
});
