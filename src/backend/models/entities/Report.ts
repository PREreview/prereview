import {
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { ReportModel } from '../reports';
import { BaseEntity } from './BaseEntity';
import { Persona } from './Persona';

@Entity()
@Index({ properties: ['author'] })
export class Report extends BaseEntity {
  [EntityRepositoryType]?: ReportModel;

  @Property({ columnType: 'text', nullable: true })
  reason?: string;

  @Property({ columnType: 'text', nullable: true })
  title?: string;

  @ManyToOne({ entity: () => Persona })
  author!: Persona;

  @Property()
  subject!: string;

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
