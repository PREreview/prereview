import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  PrimaryKey,
  Property,
  SerializedPrimaryKey,
} from '@mikro-orm/core';
import CommentModel from '../comments.ts';
import Persona from './persona.ts';
import Preprint from './preprint.ts';

@Entity()
export default class Comment {
  [EntityRepositoryType]: CommentModel;

  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

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
