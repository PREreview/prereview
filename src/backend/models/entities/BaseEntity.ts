import { v4 as uuidv4 } from 'uuid';
import { PrimaryKey, Property, Unique } from '@mikro-orm/core';

export abstract class BaseEntity {
  @PrimaryKey({ hidden: true })
  id!: number;

  @Property({ type: 'string' })
  @Unique()
  uuid = uuidv4();

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
