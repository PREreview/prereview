import { EntitySchema } from '@mikro-orm/core';
import { ContactModel } from '../contacts';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

export class Contact extends BaseEntity {
  schema!: string;
  value!: string;
  identity!: User;
  isVerified: boolean;
  isNotified: boolean;
  isPublic: boolean;
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

export const contactSchema = new EntitySchema<Contact, BaseEntity>({
  class: Contact,
  customRepository: () => ContactModel,
  indexes: [{ properties: 'identity' }],
  properties: {
    schema: { type: 'string' },
    value: { type: 'string' },
    identity: { reference: 'm:1', entity: () => User },
    isVerified: { type: 'boolean' },
    isNotified: { type: 'boolean' },
    isPublic: { type: 'boolean' },
    token: { type: 'string', nullable: true },
  },
});
