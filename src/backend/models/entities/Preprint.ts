import {
  Collection,
  Entity,
  EntityRepositoryType,
  Index,
  ManyToMany,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { PreprintModel } from '../preprints';
import { BaseEntity } from './BaseEntity';
import { Community } from './Community';
import { FullReview } from './FullReview';
import { RapidReview } from './RapidReview';
import { Request } from './Request';
import { Tag } from './Tag';

@Entity()
@Index({
  name: 'preprint_trgm',
  properties: ['title', 'handle', 'abstractText', 'authors'],
})
export class Preprint extends BaseEntity {
  [EntityRepositoryType]?: PreprintModel;

  @Property()
  @Unique()
  handle!: string;

  @Property({ columnType: 'text' })
  title!: string;

  @Property({ columnType: 'text', nullable: true })
  authors?: string;

  @Property()
  isPublished!: boolean;

  @Property({ columnType: 'text', nullable: true })
  abstractText?: string;

  @Property({ nullable: true })
  preprintServer?: string;

  @Property({ nullable: true })
  datePosted?: Date;

  @Property({ nullable: true })
  license?: string;

  @Property({ nullable: true })
  publication?: string;

  @Property({ nullable: true })
  url?: string;

  @Property({ nullable: true })
  contentEncoding?: string;

  @Property({ nullable: true })
  contentUrl?: string;

  //@Property({ persist: false })
  //get fullReviewCount(): number {
  //  return this.fullReviews.count();
  //}

  //@Property({ persist: false })
  //get rapidReviewCount(): number {
  //  return this.rapidReviews.count();
  //}

  //@Property({ persist: false })
  //get requestCount(): number {
  //  return this.requests.count();
  //}

  @OneToMany({ entity: () => RapidReview, mappedBy: 'preprint' })
  rapidReviews: Collection<RapidReview> = new Collection<RapidReview>(this);

  @OneToMany({ entity: () => FullReview, mappedBy: 'preprint' })
  fullReviews: Collection<FullReview> = new Collection<FullReview>(this);

  @OneToMany({ entity: () => Request, mappedBy: 'preprint' })
  requests: Collection<Request> = new Collection<Request>(this);

  @ManyToMany({ entity: () => Community, mappedBy: 'preprints' })
  communities: Collection<Community> = new Collection<Community>(this);

  @ManyToMany({ entity: () => Tag, mappedBy: 'preprints' })
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
