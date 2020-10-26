import {
  Entity,
  EntityRepositoryType,
  JsonType,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { RapidReviewModel } from '../rapidReviews';
import Persona from './Persona';
import Preprint from './Preprint';

@Entity()
export class RapidReview {
  [EntityRepositoryType]?: RapidReviewModel;

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @ManyToOne()
  author!: Persona;

  @ManyToOne()
  preprint!: Preprint;

  @Property({ type: JsonType })
  contents!: Record<string, unknown>;

  constructor(contents: Record<string, unknown>) {
    this.contents = contents;
  }
}
