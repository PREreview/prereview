import {
  Entity,
  EntityRepositoryType,
  OneToMany,
  PrimaryKey,
  Property,
  SerializedPrimaryKey,
} from '@mikro-orm/core';
import PreprintModel from '../preprints.ts';
import FullReview from './fullReview.ts';
import RapidReview from './rapidReview.ts';
import Request from './request.ts';
import Tag from './tag.ts';

@Entity()
export default class Preprint {
  [EntityRepositoryType]: PreprintModel;

  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  title!: string;

  @Property()
  uuid!: string;

  @Property()
  url!: string;

  @OneToMany()
  rapidReviews = new Collection<RapidReview>(this);

  @OneToMany()
  fullReviews = new Collection<FullReview>(this);

  @OneToMany()
  requests = new Collection<Request>(this);

  @ManyToMany()
  tags = new Collection<Tag>(this);

  constructor(title: string, uuid: string, url: string) {
    this.title = title;
    this.uuid = uuid;
    this.url = url;
  }
}
