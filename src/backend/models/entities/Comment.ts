import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { CommentModel } from '../comments';
import { BaseEntity } from './BaseEntity';
import { Persona } from './Persona';
import { Preprint } from './Preprint';

@Entity()
export class Comment extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: CommentModel;

  @Property()
  contents!: string;

  @ManyToOne({ entity: () => Persona })
  author!: Persona;

  @ManyToOne({ entity: () => Preprint })
  parent!: Preprint;

  constructor(contents: string) {
    super();
    this.contents = contents;
  }
}
