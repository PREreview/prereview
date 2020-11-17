import {
  Entity,
  EntityRepositoryType,
  JsonType,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { RapidReviewModel } from '../rapidReviews';
import { BaseEntity } from './BaseEntity';
import { Persona } from './Persona';
import { Preprint } from './Preprint';

@Entity()
export class RapidReview extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: RapidReviewModel;

  @ManyToOne({ entity: () => Persona })
  author!: Persona;

  @ManyToOne({ entity: () => Preprint })
  preprint!: Preprint;

  @Fixture(() => ({
    data: 'Test data',
  }))
  @Property({ type: JsonType })
  contents!: Record<string, unknown>;

  constructor(contents: Record<string, unknown>) {
    super();
    this.contents = contents;
  }
}
