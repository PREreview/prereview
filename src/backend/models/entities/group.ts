import {
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';

@Entity()
export class Group {
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  @Unique()
  name!: string;

  @ManyToMany()
  members = new Collection<User>(this);

  constructor(name: string) {
    this.name = name;
  }
}
