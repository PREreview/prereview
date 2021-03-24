import {
  Entity,
  EntityRepositoryType,
  Enum,
  Index,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
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
export class RapidReview extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: RapidReviewModel;

  @ManyToOne({ entity: () => Persona })
  @Index()
  author!: Persona;

  @ManyToOne({ entity: () => Preprint })
  @Index()
  preprint!: Preprint;

  //eslint-disable-next-line
  @Property()
  isPublished: boolean = false;

  //eslint-disable-next-line
  @Property()
  isFlagged: boolean = false;

  @Fixture({ enum: Checkboxes })
  @Enum(() => Checkboxes)
  ynNovel = Checkboxes.na;

  @Fixture({ enum: Checkboxes })
  @Enum(() => Checkboxes)
  ynFuture = Checkboxes.na;

  @Fixture({ enum: Checkboxes })
  @Enum(() => Checkboxes)
  ynReproducibility = Checkboxes.na;

  @Fixture({ enum: Checkboxes })
  @Enum(() => Checkboxes)
  ynMethods = Checkboxes.na;

  @Fixture({ enum: Checkboxes })
  @Enum(() => Checkboxes)
  ynCoherent = Checkboxes.na;

  @Fixture({ enum: Checkboxes })
  @Enum(() => Checkboxes)
  ynLimitations = Checkboxes.na;

  @Fixture({ enum: Checkboxes })
  @Enum(() => Checkboxes)
  ynEthics = Checkboxes.na;

  @Fixture({ enum: Checkboxes })
  @Enum(() => Checkboxes)
  ynNewData = Checkboxes.na;

  @Fixture({ enum: Checkboxes })
  @Enum(() => Checkboxes)
  ynRecommend = Checkboxes.na;

  @Fixture({ enum: Checkboxes })
  @Enum(() => Checkboxes)
  ynPeerReview = Checkboxes.na;

  @Fixture({ enum: Checkboxes })
  @Enum(() => Checkboxes)
  ynAvailableCode = Checkboxes.na;

  @Fixture({ enum: Checkboxes })
  @Enum(() => Checkboxes)
  ynAvailableData = Checkboxes.na;

  @Fixture(faker => faker.lorem.sentence())
  @Property({ columnType: 'text', nullable: true })
  linkToData?: string;

  @Fixture(faker => faker.lorem.sentence())
  @Property({ columnType: 'text', nullable: true })
  coi?: string;

  constructor(author: Persona, preprint: Preprint) {
    super();
    this.author = author;
    this.preprint = preprint;
  }
}
