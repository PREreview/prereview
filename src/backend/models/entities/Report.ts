import { v4 as uuidv4 } from 'uuid';
import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { ReportModel } from '../reports';
import { BaseEntity } from './BaseEntity';
import { Persona } from './Persona';

@Entity()
export class Report extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: ReportModel;

  @Fixture(faker => faker.lorem.sentences())
  @Property({ columnType: 'text', nullable: true })
  reason?: string;

  @ManyToOne({ entity: () => Persona })
  author!: Persona;

  @Fixture(() => uuidv4())
  subject!: string;

  constructor(reason: string, author: Persona, subject: string) {
    super();
    this.reason = reason;
    this.author = author;
    this.subject = subject;
  }
}
