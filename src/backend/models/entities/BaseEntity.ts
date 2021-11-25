import { EntitySchema } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseEntity {
  id!: number;
  uuid = uuidv4();
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}

export const baseEntitySchema = new EntitySchema<BaseEntity>({
  name: 'BaseEntity',
  abstract: true,
  properties: {
    id: { type: 'number', hidden: true, primary: true },
    uuid: { type: 'string', unique: true },
    createdAt: { type: 'Date' },
    updatedAt: { type: 'Date', onUpdate: () => new Date() },
  },
});
