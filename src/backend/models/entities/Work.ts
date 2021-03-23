import {
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { WorkModel } from '../works';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { createRandomDoi } from '../../../common/utils/ids';

@Entity()
export class Work extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: WorkModel;

  @Fixture(faker => `${faker.commerce.color()} ${faker.random.word()}`)
  @Property({ columnType: 'text', nullable: true })
  title?: string;

  @ManyToOne({ entity: () => User })
  @Index()
  author!: User;

  @Fixture(faker => faker.internet.url())
  @Property({ columnType: 'text', nullable: true })
  url?: string;

  @Fixture(faker => faker.random.word())
  @Property({ nullable: true })
  type?: string;

  @Fixture({ get: () => `doi:${createRandomDoi()}`, optional: true })
  @Property({ nullable: true })
  handle?: string;

  @Property({ nullable: true })
  publicationDate?: Date;

  @Fixture(faker => faker.random.word())
  @Property({ columnType: 'text', nullable: true })
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
