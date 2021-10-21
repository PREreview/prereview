import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { EventModel } from '../events';
import { BaseEntity } from './BaseEntity';
import { Community } from './Community';

@Entity()
export class Event extends BaseEntity {
  [EntityRepositoryType]?: EventModel;

  @Property()
  title!: string;

  @Property()
  start!: Date;

  @Property({ nullable: true })
  end?: Date;

  @Property()
  isPrivate: boolean = false;

  @Property({ columnType: 'text', nullable: true })
  description?: string;

  @Property({ columnType: 'text', nullable: true })
  url?: string;

  @ManyToOne({ entity: () => Community, nullable: true })
  community?: Community;

  constructor(
    title: string,
    start: Date,
    end?: Date,
    isPrivate = false,
    description?: string,
    community?: Community,
  ) {
    super();
    this.title = title;
    this.start = start;
    this.end = end;
    this.isPrivate = isPrivate;
    this.description = description;
    this.community = community;
  }
}
