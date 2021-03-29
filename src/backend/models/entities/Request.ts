import {
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { RequestModel } from '../requests';
import { BaseEntity } from './BaseEntity';
import { Persona } from './Persona';
import { Preprint } from './Preprint';

@Entity()
@Index({ properties: ['author'] })
@Index({ properties: ['preprint'] })
export class Request extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: RequestModel;

  @ManyToOne({ entity: () => Persona })
  author!: Persona;

  @ManyToOne({ entity: () => Preprint })
  preprint!: Preprint;

  //eslint-disable-next-line
  @Fixture(() => false)
  @Property()
  isPreprintAuthor: boolean = false;

  constructor(author: Persona, preprint: Preprint, isPreprintAuthor = false) {
    super();
    this.author = author;
    this.preprint = preprint;
    this.isPreprintAuthor = isPreprintAuthor;
  }
}
