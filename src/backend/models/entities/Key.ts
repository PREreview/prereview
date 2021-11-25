import { EntitySchema } from '@mikro-orm/core';
import uuidApiKey from 'uuid-apikey';
import { KeyModel } from '../keys';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

export class Key extends BaseEntity {
  owner!: User;
  app!: string;
  secret!: string;

  constructor(owner: User, app: string) {
    super();
    this.owner = owner;
    this.app = app;
    this.secret = uuidApiKey.create().apiKey;
  }
}

export const keySchema = new EntitySchema<Key, BaseEntity>({
  class: Key,
  customRepository: () => KeyModel,
  properties: {
    owner: { reference: 'm:1', entity: () => User },
    app: { type: 'string' },
    secret: { type: 'string' },
  },
});
