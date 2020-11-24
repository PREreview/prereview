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
import {
  createRandomArxivId,
  createRandomDoi,
} from '../../../common/utils/ids';

@Entity()
export class Preprint extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: PreprintModel;

  @Fixture(faker => `${faker.commerce.color()} ${faker.random.word()}`)
  @Property()
  title!: string;

  @Property({ nullable: true })
  uuid?: string;

  @Fixture({ get: () => createRandomDoi(), optional: true })
  @Property({ nullable: true })
  @Unique()
  doi?: string;

  @Fixture({ get: () => createRandomArxivId(), optional: true })
  @Property({ nullable: true })
  arxivid?: string;

  @Fixture(faker => faker.random.arrayElement(['arxiv', 'biorxiv', 'medrxiv']))
  @Property({ nullable: true })
  preprintServer?: string;

  @Fixture(faker =>
    faker.random.arrayElement(['image/png', 'image/jpeg', 'application/pdf']),
  )
  @Property({ nullable: true })
  encodingFormat?: string;

  @Property({ nullable: true })
  datePosted?: Date;

  @Fixture(faker => faker.internet.url())
  @Property()
  url!: string;

  @Fixture(
    () =>
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  )
  @Property()
  pdfUrl!: string;

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

  constructor(title: string, uuid: string, url: string) {
    super();
    this.title = title;
    this.uuid = uuid;
    this.url = url;
  }
}
