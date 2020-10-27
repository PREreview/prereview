import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { TagModel } from '../tags';
import Preprint from './preprint';

@Entity()
export default class Tag {
  [EntityRepositoryType]: TagModel;

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  @Unique()
  name!: string;

  @Property()
  color?: string;

  @ManyToMany('Preprint', 'tags', { owner: true })
  preprints = new Collection<Preprint>(this);

  constructor(name: string, color = '#FF0000') {
    this.name = name;
    this.color = color;
  }
}
