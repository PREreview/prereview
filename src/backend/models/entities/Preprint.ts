import {
  Collection,
  Entity,
  EntityRepositoryType,
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

  @Fixture(faker => `${faker.commerce.color()} ${faker.random.word()}`)
  @Property()
  title!: string;

  @Fixture({ get: () => createRandomDoi() })
  @Property()
  @Unique()
  handle!: string;

  @Fixture(() => true)
  @Property()
  published!: boolean;

  @Fixture(faker => faker.random.arrayElement(['arxiv', 'biorxiv', 'medrxiv']))
  @Property({ nullable: true })
  preprintServer?: string;

  @Property({ nullable: true })
  datePosted?: Date;

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
  @Property()
  contentUrl!: string;

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
  rapidReviews: Collection<RapidReview> = new Collection<RapidReview>(this);

  @OneToMany({ entity: () => FullReview, mappedBy: 'preprint' })
  fullReviews: Collection<FullReview> = new Collection<FullReview>(this);

  @OneToMany({ entity: () => Request, mappedBy: 'preprint' })
  requests: Collection<Request> = new Collection<Request>(this);

  @ManyToMany({ entity: () => Community, mappedBy: 'preprints' })
  communities: Collection<Community> = new Collection<Community>(this);

  @ManyToMany({ entity: () => Tag, mappedBy: 'preprints' })
  tags: Collection<Tag> = new Collection<Tag>(this);

  constructor(title: string, handle: string, url: string, published = false) {
    super();
    this.title = title;
    this.handle = handle;
    this.url = url;
    this.published = published;
  }
}
