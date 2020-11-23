import {
  Entity,
  EntityRepositoryType,
  Property,
  Unique,
} from '@mikro-orm/core';
import { SessionKeyModel } from '../sessionKeys';
import { BaseEntity } from './BaseEntity';

@Entity()
export class SessionKey extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: SessionKeyModel;

  @Property()
  @Unique()
  key!: string;

  constructor(key: string) {
    super();
    this.key = key;
  }
}
