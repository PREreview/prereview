import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { CommentModel } from '../comments';
import Persona from './Persona';
import Preprint from './Preprint';

@Entity()
export class Comment {
  [EntityRepositoryType]?: CommentModel;

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  title!: string;

  @Property()
  contents!: string;

  @ManyToOne()
  author!: Persona;

  @ManyToOne()
  parent!: Preprint;

  constructor(title: string, contents: string) {
    this.title = title;
    this.contents = contents;
  }
}
