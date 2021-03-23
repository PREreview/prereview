import {
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { ContactModel } from '../contacts';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity()
export class Contact extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: ContactModel;

  @Fixture(() => 'mailto')
  @Property()
  schema!: string;

  @Fixture(faker => faker.internet.email())
  @Property()
  value!: string;

  @ManyToOne({ entity: () => User })
  @Index()
  identity!: User;

  @Fixture(() => false)
  @Property()
  isVerified: boolean;

  @Fixture(() => false)
  @Property()
  isNotified: boolean;

  @Fixture(faker => faker.random.alphaNumeric(16))
  @Property({ nullable: true })
  token?: string;

  constructor(
    schema: string,
    value: string,
    identity: User,
    isVerified = false,
    isNotified = false,
  ) {
    super();
    this.schema = schema;
    this.value = value;
    this.identity = identity;
    this.isVerified = isVerified;
    this.isNotified = isNotified;
  }
}
