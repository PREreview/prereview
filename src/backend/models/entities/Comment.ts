import {
  Entity,
  EntityRepositoryType,
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
  @Property()
  contents!: string;

  @ManyToOne({ entity: () => Persona })
  author!: Persona;

  @ManyToOne({ entity: () => FullReview })
  parent!: FullReview;

  constructor(contents: string) {
    super();
    this.contents = contents;
  }
}
