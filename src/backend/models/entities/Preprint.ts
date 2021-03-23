import {
  ArrayType,
  Collection,
  Entity,
  EntityRepositoryType,
  Index,
  ManyToMany,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { PreprintModel } from '../preprints';
import { BaseEntity } from './BaseEntity';
import { Community } from './Community';
import { FullReview } from './FullReview';
import { RapidReview } from './RapidReview';
import { Request } from './Request';
import { Tag } from './Tag';
import { createRandomDoi } from '../../../common/utils/ids';

@Entity()
export class Preprint extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: PreprintModel;

  @Fixture({ get: () => `doi:${createRandomDoi()}` })
  @Property()
  @Unique()
  handle!: string;

  @Fixture(faker => `${faker.commerce.color()} ${faker.random.word()}`)
  @Property({ columnType: 'text' })
  title!: string;

  @Fixture(faker => faker.name.findName())
  @Property({ columnType: 'text', nullable: true })
  authors?: string;

  @Fixture(() => true)
  @Property()
  isPublished!: boolean;

  @Fixture(faker => faker.lorem.paragraph())
  @Property({ columnType: 'text', nullable: true })
  abstractText?: string;

  @Fixture(faker => faker.random.arrayElement(['arxiv', 'biorxiv', 'medrxiv']))
  @Property({ nullable: true })
  preprintServer?: string;

  @Property({ nullable: true })
  datePosted?: Date;

  @Fixture(faker => faker.random.word())
  @Property({ nullable: true })
  license?: string;

  @Fixture(faker => faker.random.word())
  @Property({ nullable: true })
  publication?: string;

  @Fixture(faker => faker.internet.url())
  @Property({ nullable: true })
  url?: string;

  @Fixture(() => 'application/pdf')
  @Property({ nullable: true })
  contentEncoding?: string;

  @Fixture(
    () =>
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  )
  @Property({ nullable: true })
  contentUrl?: string;

  //@Fixture({ ignore: true })
  //@Property({ persist: false })
  //get fullReviewCount(): number {
  //  return this.fullReviews.count();
  //}

  //@Fixture({ ignore: true })
  //@Property({ persist: false })
  //get rapidReviewCount(): number {
  //  return this.rapidReviews.count();
  //}

  //@Fixture({ ignore: true })
  //@Property({ persist: false })
  //get requestCount(): number {
  //  return this.requests.count();
  //}

  @OneToMany({ entity: () => RapidReview, mappedBy: 'preprint' })
  @Index()
  rapidReviews: Collection<RapidReview> = new Collection<RapidReview>(this);

  @OneToMany({ entity: () => FullReview, mappedBy: 'preprint' })
  @Index()
  fullReviews: Collection<FullReview> = new Collection<FullReview>(this);

  @OneToMany({ entity: () => Request, mappedBy: 'preprint' })
  @Index()
  requests: Collection<Request> = new Collection<Request>(this);

  @ManyToMany({ entity: () => Community, mappedBy: 'preprints' })
  @Index()
  communities: Collection<Community> = new Collection<Community>(this);

  @ManyToMany({ entity: () => Tag, mappedBy: 'preprints' })
  @Index()
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
