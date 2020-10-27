import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { RequestModel } from '../requests';
import Persona from './persona';
import Preprint from './preprint';

@Entity()
export default class Request {
  [EntityRepositoryType]?: RequestModel;

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @ManyToOne()
  author!: Persona;

  @ManyToOne()
  preprint!: Preprint;
}
