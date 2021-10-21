import {
  Entity,
  EntityRepositoryType,
  Enum,
  Index,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
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

@Entity()
@Index({ properties: ['author'] })
@Index({ properties: ['preprint'] })
export class RapidReview extends BaseEntity {
  [EntityRepositoryType]?: RapidReviewModel;

  @ManyToOne({ entity: () => Persona })
  author!: Persona;

  @ManyToOne({ entity: () => Preprint })
  preprint!: Preprint;

  @Property()
  isPublished: boolean = false;

  @Property()
  isFlagged: boolean = false;

  @Enum(() => Checkboxes)
  ynNovel = Checkboxes.na;

  @Enum(() => Checkboxes)
  ynFuture = Checkboxes.na;

  @Enum(() => Checkboxes)
  ynReproducibility = Checkboxes.na;

  @Enum(() => Checkboxes)
  ynMethods = Checkboxes.na;

  @Enum(() => Checkboxes)
  ynCoherent = Checkboxes.na;

  @Enum(() => Checkboxes)
  ynLimitations = Checkboxes.na;

  @Enum(() => Checkboxes)
  ynEthics = Checkboxes.na;

  @Enum(() => Checkboxes)
  ynNewData = Checkboxes.na;

  @Enum(() => Checkboxes)
  ynRecommend = Checkboxes.na;

  @Enum(() => Checkboxes)
  ynPeerReview = Checkboxes.na;

  @Enum(() => Checkboxes)
  ynAvailableCode = Checkboxes.na;

  @Enum(() => Checkboxes)
  ynAvailableData = Checkboxes.na;

  @Property({ columnType: 'text', nullable: true })
  linkToData?: string;

  @Property({ columnType: 'text', nullable: true })
  coi?: string;

  constructor(author: Persona, preprint: Preprint) {
    super();
    this.author = author;
    this.preprint = preprint;
  }
}
