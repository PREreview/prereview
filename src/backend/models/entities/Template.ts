import { EntitySchema } from '@mikro-orm/core';
import { TemplateModel } from '../templates';
import { BaseEntity } from './BaseEntity';
import { Community } from './Community';

export class Template extends BaseEntity {
  title!: string;
  contents!: string;
  community?: Community;

  constructor(title: string, contents: string, community?: Community) {
    super();
    this.title = title;
    this.contents = contents;
    this.community = community;
  }
}

export const templateSchema = new EntitySchema<Template, BaseEntity>({
  class: Template,
  customRepository: () => TemplateModel,
  indexes: [{ properties: ['community'] }],
  properties: {
    title: { type: 'string', unique: true },
    contents: { type: 'string', columnType: 'text' },
    community: { reference: 'm:1', entity: () => Community, nullable: true },
  },
});
