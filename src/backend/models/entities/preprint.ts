import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { PreprintModel } from '../preprints';
import FullReview from './FullReview';
import RapidReview from './RapidReview';
import Request from './Request';
import Tag from './Tag';

@Entity()
export class Preprint {
  [EntityRepositoryType]?: PreprintModel;

  @PrimaryKey()
  id!: number;

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

  @OneToMany('RapidReview', 'preprint')
  rapidReviews = new Collection<RapidReview>(this);

  @OneToMany('FullReview', 'preprint')
  fullReviews = new Collection<FullReview>(this);

  @OneToMany('Request', 'preprint')
  requests = new Collection<Request>(this);

  @ManyToMany()
  tags = new Collection<Tag>(this);

  constructor(title: string, uuid: string, url: string) {
    this.title = title;
    this.uuid = uuid;
    this.url = url;
  }
}
