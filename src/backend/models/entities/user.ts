import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';

@Entity()
export class User {
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
  username!: string;

  @Property()
  name!: string;

  @Property()
  @Unique()
  email!: string;

  @Property({ hidden: true })
  orcid!: string;

  @ManyToMany()
  communities = new Collection<Community>(this);

  @OneToMany()
  identities = new Collection<Persona>(this);

  @OneToMany()
  rapidReviews = new Collection<RapidReview>(this);

  @ManyToMany()
  fullReviews = new Collection<FullReview>(this);

  constructor(username: string, email: string) {
    this.username = username;
    this.email = email;
  }
}
