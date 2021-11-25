import { EntitySchema } from '@mikro-orm/core';
import { ReportModel } from '../reports';
import { BaseEntity } from './BaseEntity';
import { Persona } from './Persona';

export class Report extends BaseEntity {
  reason?: string;
  title?: string;
  author!: Persona;
  subject!: string;
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

export const reportSchema = new EntitySchema<Report, BaseEntity>({
  class: Report,
  customRepository: () => ReportModel,
  indexes: [{ properties: ['author'] }],
  properties: {
    reason: { type: 'string', columnType: 'text', nullable: true },
    title: { type: 'string', columnType: 'text', nullable: true },
    author: { reference: 'm:1', entity: () => Persona },
    subject: { type: 'string' },
    subjectType: { type: 'string' },
  },
});
