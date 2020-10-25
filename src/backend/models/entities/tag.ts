import {
  Entity,
  EntityRepositoryType,
  ManyToMany,
  PrimaryKey,
  Property,
  SerializedPrimaryKey,
} from '@mikro-orm/core';
import RapidReviewModel from '../rapidReviews.ts';
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

  @Property()
  @Unique()
  name!: string;

  @Property()
  color?: string;

  @ManyToMany(() => Preprint, preprint => preprint.tags)
  preprints = new Collection<Preprint>(this);

  constructor(name: string, color = '#FF0000') {
    this.name = name;
    this.color = color;
  }
}
