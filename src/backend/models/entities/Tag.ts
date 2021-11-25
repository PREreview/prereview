import { Collection, EntitySchema } from '@mikro-orm/core';
import { TagModel } from '../tags';
import { BaseEntity } from './BaseEntity';
import { Community } from './Community';
import { Preprint } from './Preprint';

export class Tag extends BaseEntity {
  name!: string;
  color?: string;
  preprints: Collection<Preprint> = new Collection<Preprint>(this);
  communities: Collection<Community> = new Collection<Community>(this);

  constructor(name: string, color = '#FF0000') {
    super();
    this.name = name;
    this.color = color;
  }
}

export const tagSchema = new EntitySchema<Tag, BaseEntity>({
  class: Tag,
  customRepository: () => TagModel,
  properties: {
    name: { type: 'string', unique: true },
    color: { type: 'string' },
    preprints: {
      reference: 'm:n',
      entity: () => Preprint,
      inversedBy: (preprint) => preprint.tags,
    },
    communities: {
      reference: 'm:n',
      entity: () => Community,
      mappedBy: (community) => community.tags,
    },
  },
});
