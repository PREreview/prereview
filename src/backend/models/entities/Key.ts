import {
  Entity,
  EntityRepositoryType,
  ManyToOne,
  Property,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import uuidApiKey from 'uuid-apikey';
import { KeyModel } from '../keys';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity()
export class Key extends BaseEntity {
  [EntityRepositoryType]?: KeyModel;

  @ManyToOne({ entity: () => User })
  owner!: User;

  @Fixture(faker => faker.random.alphaNumeric(16))
  @Property()
  app!: string;

  @Fixture(faker => faker.random.alphaNumeric(16))
  @Property()
  secret!: string;

  constructor(owner: User, app: string) {
    super();
    this.owner = owner;
    this.app = app;
    this.secret = uuidApiKey.create().apiKey;
  }
}
