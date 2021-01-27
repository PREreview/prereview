import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { TemplateModel } from '../templates';
import { BaseEntity } from './BaseEntity';
import { Community } from './Community';

@Entity()
export class Template extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: TemplateModel;

  @Fixture(faker => faker.lorem.sentences())
  @Property({ columnType: 'text' })
  contents!: string;

  @ManyToOne({ entity: () => Community, nullable: true })
  community?: Community;

  constructor(contents: string, community?: Community) {
    super();
    this.contents = contents;
    this.community = community;
  }
}
