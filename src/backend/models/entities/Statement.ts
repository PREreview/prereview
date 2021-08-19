import {
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { StatementModel } from '../statements';
import { BaseEntity } from './BaseEntity';
import { FullReview } from './FullReview';
import { Persona } from './Persona';

@Entity()
@Index({ properties: ['author'] })
@Index({ properties: ['parent'] })
export class Statement extends BaseEntity {
  [EntityRepositoryType]?: StatementModel;

  @Fixture(faker => faker.lorem.sentences())
  @Property({ columnType: 'text' })
  contents!: string;

  @Property()
  isFlagged: boolean = false;

  @ManyToOne({ entity: () => Persona })
  author!: Persona;

  @ManyToOne({ entity: () => FullReview })
  parent!: FullReview;

  constructor(contents: string, author: Persona, parent: FullReview) {
    super();
    this.contents = contents;
    this.author = author;
    this.parent = parent;
  }
}
