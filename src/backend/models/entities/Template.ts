import {
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  Property,
  Unique,
} from '@mikro-orm/core';
import { TemplateModel } from '../templates';
import { BaseEntity } from './BaseEntity';
import { Community } from './Community';

@Entity()
@Index({ properties: ['community'] })
export class Template extends BaseEntity {
  [EntityRepositoryType]?: TemplateModel;

  @Property()
  @Unique()
  title!: string;

  @Property({ columnType: 'text' })
  contents!: string;

  @ManyToOne({ entity: () => Community, nullable: true })
  community?: Community;

  constructor(title: string, contents: string, community?: Community) {
    super();
    this.title = title;
    this.contents = contents;
    this.community = community;
  }
}
