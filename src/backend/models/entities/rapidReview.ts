import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  PrimaryKey,
  Property,
  SerializedPrimaryKey,
} from '@mikro-orm/core';
import RapidReviewModel from '../rapidReviews.ts';
import Persona from './persona.ts';
import Preprint from './preprint.ts';

@Entity()
export default class RapidReview {
  [EntityRepositoryType]: RapidReviewModel;

  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

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
