import {
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { TemplateModel } from '../templates';
import { BaseEntity } from './BaseEntity';
import { Community } from './Community';

@Entity()
export class Template extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: TemplateModel;

  @Fixture(faker => `${faker.commerce.color()} ${faker.random.word()}`)
  @Property()
  @Unique()
  title!: string;

  @Fixture(faker => faker.lorem.sentences())
  @Property({ columnType: 'text' })
  contents!: string;

  @ManyToOne({ entity: () => Community, nullable: true })
  @Index()
  community?: Community;

  constructor(title: string, contents: string, community?: Community) {
    super();
    this.title = title;
    this.contents = contents;
    this.community = community;
  }
}
