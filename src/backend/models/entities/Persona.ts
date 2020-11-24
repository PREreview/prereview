import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { PersonaModel } from '../personas';
import { BaseEntity } from './BaseEntity';
import { FullReview } from './FullReview';
import { RapidReview } from './RapidReview';
import { User } from './User';

@Entity()
export class Persona extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: PersonaModel;

  @Fixture(faker => faker.name.findName())
  @Property()
  @Unique()
  name!: string;

  @ManyToOne({ entity: () => User })
  identity!: User;

  //@Fixture({ get: faker => faker.image.avatar(), optional: true })
  @Fixture(faker => faker.image.avatar())
  @Property({ nullable: true })
  avatar?: Buffer;

  @OneToMany({ entity: () => RapidReview, mappedBy: 'author' })
  rapidReviews: Collection<RapidReview> = new Collection<RapidReview>(this);

  @ManyToMany({ entity: () => FullReview, mappedBy: 'authors' })
  fullReviews: Collection<FullReview> = new Collection<FullReview>(this);

  constructor(name: string, avatar: Buffer) {
    super();
    this.name = name;
    this.avatar = avatar;
  }
}
