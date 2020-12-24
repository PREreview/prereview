import { Entity, EntityRepositoryType, ManyToOne } from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { RequestModel } from '../requests';
import { BaseEntity } from './BaseEntity';
import { Persona } from './Persona';
import { Preprint } from './Preprint';

@Entity()
export class Request extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: RequestModel;

  @ManyToOne({ entity: () => Persona })
  author!: Persona;

  @ManyToOne({ entity: () => Preprint })
  preprint!: Preprint;

  constructor(author: Persona, preprint: Preprint) {
    super();
    this.author = author;
    this.preprint = preprint;
  }
}
