import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { PersonaModel } from '../personas';
import FullReview from './FullReview';
import RapidReview from './RapidReview';
import User from './User';

@Entity()
export class Persona {
  [EntityRepositoryType]: PersonaModel;

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  @Unique()
  name!: string;

  @ManyToOne()
  identity!: User;

  @Property()
  avatar?: Buffer;

  @OneToMany('RapidReview', 'author')
  rapidReviews = new Collection<RapidReview>(this);

  @ManyToMany()
  fullReviews = new Collection<FullReview>(this);

  constructor(name: string, avatar: Buffer) {
    this.name = name;
    this.avatar = avatar;
  }
}
