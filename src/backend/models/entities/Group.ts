import { Collection, EntitySchema } from '@mikro-orm/core';
import { GroupModel } from '../groups';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

export class Group extends BaseEntity {
  name!: string;
  members: Collection<User> = new Collection<User>(this);

  constructor(name: string) {
    super();
    this.name = name;
  }
}

export const groupSchema = new EntitySchema<Group, BaseEntity>({
  class: Group,
  customRepository: () => GroupModel,
  properties: {
    name: { type: 'string', unique: true },
    members: {
      reference: 'm:n',
      entity: () => User,
      inversedBy: (user) => user.groups,
    },
  },
});
