import {
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { CommentModel } from '../comments';
import { BaseEntity } from './BaseEntity';
import { FullReview } from './FullReview';
import { Persona } from './Persona';

@Entity()
export class Comment extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: CommentModel;

  @Fixture(faker => faker.lorem.sentences())
  @Property({ columnType: 'text' })
  contents!: string;

  //eslint-disable-next-line
  @Property()
  isPublished: boolean = false;

  //eslint-disable-next-line
  @Property()
  isFlagged: boolean = false;

  @ManyToOne({ entity: () => Persona })
  @Index()
  author!: Persona;

  @ManyToOne({ entity: () => FullReview })
  @Index()
  parent!: FullReview;

  constructor(contents: string, author: Persona, parent: FullReview) {
    super();
    this.contents = contents;
    this.author = author;
    this.parent = parent;
  }
}
