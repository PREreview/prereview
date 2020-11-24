import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToMany,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Fixture } from 'class-fixtures-factory';
import { CommunityModel } from '../communities';
import { BaseEntity } from './BaseEntity';
import { Preprint } from './Preprint';
import { User } from './User';

@Entity()
export class Community extends BaseEntity {
  //eslint-disable-next-line
  [EntityRepositoryType]?: CommunityModel;

  @Fixture(faker => `${faker.commerce.color()} ${faker.random.word()}`)
  @Property()
  @Unique()
  name!: string;

  //@Fixture({ get: faker => faker.lorem.paragraph(), optional: true })
  @Fixture(faker => faker.lorem.sentences())
  @Property()
  description?: string;

  //@Fixture({ get: faker => faker.image.abstract(), optional: true })
  @Fixture(faker => faker.image.abstract())
  @Property()
  logo?: Buffer;

  @ManyToMany({ entity: () => User, mappedBy: 'communities', owner: true })
  members: Collection<User> = new Collection<User>(this);

  @ManyToMany({ entity: () => Preprint, mappedBy: 'communities', owner: true })
  preprints: Collection<Preprint> = new Collection<Preprint>(this);

  constructor(name: string, description: string, logo: Buffer) {
    super();
    this.name = name;
    this.description = description;
    this.logo = logo;
  }
}
