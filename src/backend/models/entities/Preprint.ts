import { Collection, EntitySchema } from '@mikro-orm/core';
import { PreprintModel } from '../preprints';
import { BaseEntity } from './BaseEntity';
import { Community } from './Community';
import { FullReview } from './FullReview';
import { RapidReview } from './RapidReview';
import { Request } from './Request';
import { Tag } from './Tag';

export class Preprint extends BaseEntity {
  handle!: string;
  title!: string;
  authors?: string;
  isPublished!: boolean;
  abstractText?: string;
  preprintServer?: string;
  datePosted?: Date;
  license?: string;
  publication?: string;
  url?: string;
  contentEncoding?: string;
  contentUrl?: string;
  rapidReviews: Collection<RapidReview> = new Collection<RapidReview>(this);
  fullReviews: Collection<FullReview> = new Collection<FullReview>(this);
  requests: Collection<Request> = new Collection<Request>(this);
  communities: Collection<Community> = new Collection<Community>(this);
  tags: Collection<Tag> = new Collection<Tag>(this);

  constructor(
    handle: string,
    title: string,
    isPublished = false,
    abstractText?: string,
    preprintServer?: string,
    datePosted?: Date,
    license?: string,
    publication?: string,
    url?: string,
    contentEncoding?: string,
    contentUrl?: string,
  ) {
    super();
    this.handle = handle;
    this.title = title;
    this.isPublished = isPublished;
    this.abstractText = abstractText;
    this.preprintServer = preprintServer;
    this.datePosted = datePosted;
    this.license = license;
    this.publication = publication;
    this.url = url;
    this.contentEncoding = contentEncoding;
    this.contentUrl = contentUrl;
  }
}

export const preprintSchema = new EntitySchema<Preprint, BaseEntity>({
  class: Preprint,
  customRepository: () => PreprintModel,
  indexes: [
    {
      name: 'preprint_trgm',
      properties: ['title', 'handle', 'abstractText', 'authors'],
    },
  ],
  properties: {
    handle: { type: 'string', unique: true },
    title: { type: 'string', columnType: 'text' },
    authors: { type: 'string', columnType: 'text', nullable: true },
    isPublished: { type: 'boolean' },
    abstractText: { type: 'string', columnType: 'text', nullable: true },
    preprintServer: { type: 'string', nullable: true },
    datePosted: { type: 'Date', nullable: true },
    license: { type: 'string', nullable: true },
    publication: { type: 'string', nullable: true },
    url: { type: 'string', nullable: true },
    contentEncoding: { type: 'string', nullable: true },
    contentUrl: { type: 'string', nullable: true },
    rapidReviews: {
      reference: '1:m',
      entity: () => RapidReview,
      mappedBy: (rapidReview) => rapidReview.preprint,
    },
    fullReviews: {
      reference: '1:m',
      entity: () => FullReview,
      mappedBy: (fullReview) => fullReview.preprint,
    },
    requests: {
      reference: '1:m',
      entity: () => Request,
      mappedBy: (request) => request.preprint,
    },
    communities: {
      reference: 'm:n',
      entity: () => Community,
      mappedBy: (community) => community.preprints,
    },
    tags: {
      reference: 'm:n',
      entity: () => Tag,
      mappedBy: (tag) => tag.preprints,
    },
  },
});
