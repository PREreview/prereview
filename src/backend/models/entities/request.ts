import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  PrimaryKey,
  Property,
  SerializedPrimaryKey,
} from '@mikro-orm/core';
import RequestModel from '../requests.ts';
import Persona from './persona.ts';
import Preprint from './preprint.ts';

@Entity()
export default class Request {
  [EntityRepositoryType]: RequestModel;

  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @ManyToOne()
  author!: Persona;

  @ManyToOne()
  preprint!: Preprint;
}
