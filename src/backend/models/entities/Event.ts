import { EntitySchema } from '@mikro-orm/core';
import { EventModel } from '../events';
import { BaseEntity } from './BaseEntity';
import { Community } from './Community';

export class Event extends BaseEntity {
  title!: string;
  start!: Date;
  end?: Date;
  isPrivate: boolean = false;
  description?: string;
  url?: string;
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

export const eventSchema = new EntitySchema<Event, BaseEntity>({
  class: Event,
  customRepository: () => EventModel,
  properties: {
    title: { type: 'string' },
    start: { type: 'Date' },
    end: { type: 'Date', nullable: true },
    isPrivate: { type: 'boolean' },
    description: { type: 'string', nullable: true },
    url: { type: 'string', columnType: 'text', nullable: true },
    community: { reference: 'm:1', entity: () => Community, nullable: true },
  },
});
