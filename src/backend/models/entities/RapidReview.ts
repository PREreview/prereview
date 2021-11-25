import { EntitySchema } from '@mikro-orm/core';
import { RapidReviewModel } from '../rapidReviews';
import { BaseEntity } from './BaseEntity';
import { Persona } from './Persona';
import { Preprint } from './Preprint';

enum Checkboxes {
  yes = 'yes',
  no = 'no',
  na = 'N/A',
  unsure = 'unsure',
}

export class RapidReview extends BaseEntity {
  author!: Persona;
  preprint!: Preprint;
  isPublished: boolean = false;
  isFlagged: boolean = false;
  ynNovel = Checkboxes.na;
  ynFuture = Checkboxes.na;
  ynReproducibility = Checkboxes.na;
  ynMethods = Checkboxes.na;
  ynCoherent = Checkboxes.na;
  ynLimitations = Checkboxes.na;
  ynEthics = Checkboxes.na;
  ynNewData = Checkboxes.na;
  ynRecommend = Checkboxes.na;
  ynPeerReview = Checkboxes.na;
  ynAvailableCode = Checkboxes.na;
  ynAvailableData = Checkboxes.na;
  linkToData?: string;
  coi?: string;

  constructor(author: Persona, preprint: Preprint) {
    super();
    this.author = author;
    this.preprint = preprint;
  }
}

export const rapidReviewSchema = new EntitySchema<RapidReview, BaseEntity>({
  class: RapidReview,
  customRepository: () => RapidReviewModel,
  indexes: [{ properties: ['author'] }, { properties: ['preprint'] }],
  properties: {
    author: { reference: 'm:1', entity: () => Persona },
    preprint: { reference: 'm:1', entity: () => Preprint },
    isPublished: { type: 'boolean' },
    isFlagged: { type: 'boolean' },
    ynNovel: { enum: true, items: () => Checkboxes },
    ynFuture: { enum: true, items: () => Checkboxes },
    ynReproducibility: { enum: true, items: () => Checkboxes },
    ynMethods: { enum: true, items: () => Checkboxes },
    ynCoherent: { enum: true, items: () => Checkboxes },
    ynLimitations: { enum: true, items: () => Checkboxes },
    ynEthics: { enum: true, items: () => Checkboxes },
    ynNewData: { enum: true, items: () => Checkboxes },
    ynRecommend: { enum: true, items: () => Checkboxes },
    ynPeerReview: { enum: true, items: () => Checkboxes },
    ynAvailableCode: { enum: true, items: () => Checkboxes },
    ynAvailableData: { enum: true, items: () => Checkboxes },
    linkToData: { type: 'string', columnType: 'text', nullable: true },
    coi: { type: 'string', columnType: 'text', nullable: true },
  },
});
