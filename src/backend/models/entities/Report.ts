import { v4 as uuidv4 } from 'uuid';
import {
  Entity,
  EntityRepositoryType,
  Index,
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

  @Fixture(faker => `${faker.commerce.color()} ${faker.random.word()}`)
  @Property({ columnType: 'text', nullable: true })
  title?: string;

  @ManyToOne({ entity: () => Persona })
  @Index()
  author!: Persona;

  @Fixture(() => uuidv4())
  @Property()
  subject!: string;

  @Fixture(() => 'comment')
  @Property()
  subjectType!: string;

  constructor(
    author: Persona,
    subject: string,
    subjectType: string,
    reason?: string,
    title?: string,
  ) {
    super();
    this.author = author;
    this.subject = subject;
    this.subjectType = subjectType;
    this.reason = reason;
    this.title = title;
  }
}
