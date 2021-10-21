import {
  Entity,
  EntityRepositoryType,
  Index,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { ContactModel } from '../contacts';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity()
@Index({ properties: ['identity'] })
export class Contact extends BaseEntity {
  [EntityRepositoryType]?: ContactModel;

  @Property()
  schema!: string;

  @Property()
  value!: string;

  @ManyToOne({ entity: () => User })
  identity!: User;

  @Property()
  isVerified: boolean;

  @Property()
  isNotified: boolean;

  @Property()
  isPublic: boolean;

  @Property({ nullable: true })
  token?: string;

  constructor(
    schema: string,
    value: string,
    identity: User,
    isVerified = false,
    isNotified = false,
    isPublic = false,
  ) {
    super();
    this.schema = schema;
    this.value = value;
    this.identity = identity;
    this.isVerified = isVerified;
    this.isNotified = isNotified;
    this.isPublic = isPublic;
  }
}
