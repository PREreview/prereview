import {
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { WorkModel } from '../works';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity()
@Index({ properties: ['author'] })
export class Work extends BaseEntity {
  [EntityRepositoryType]?: WorkModel;

  @Property({ columnType: 'text', nullable: true })
  title?: string;

  @ManyToOne({ entity: () => User })
  author!: User;

  @Property({ columnType: 'text', nullable: true })
  url?: string;

  @Property({ nullable: true })
  type?: string;

  @Property({ nullable: true })
  handle?: string;

  @Property({ nullable: true })
  publicationDate?: Date;

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
