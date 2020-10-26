import { MikroORM } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Comment, Community, FullReview, FullReviewDraft, Group, Persona, Preprint, RapidReview, Request, Tag, User } from './models/entities'

const dbWrapper = async (
  dbType: string,
  dbHost: string,
  dbPort: number,
  dbName: string,
  dbUser: string,
  dbPass: string,
): [MikroORM, function] => {
  const authString = dbUser && dbPass ? `${dbUser}:${dbPass}@` : '';
  const portString = dbPort ? `:${dbPort}` : '';

  const orm = await MikroORM.init({
    metadataProvider: TsMorphMetadataProvider, // use actual TS types
    entities: [Comment, Community, FullReview, FullReviewDraft, Group, Persona, Preprint, RapidReview, Request, Tag, User],
    type: dbType,
    clientUrl: `${dbType}://${authString}${dbHost}${portString}/${dbName}`,
  });
  const dbMiddleware = (_, next) => RequestContext.createAsync(orm.em, next);
  return [orm, dbMiddleware];
};

export default dbWrapper;
