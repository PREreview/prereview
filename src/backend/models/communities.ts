import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { ORCID as orcidUtils } from 'orcid-utils';
import { validate as uuidValidate } from 'uuid';
import { Community, User } from './entities';
import { getLogger } from '../log.js';

const log = getLogger('backend:models:communities');

@Repository(Community)
export class CommunityModel extends EntityRepository<Community> {
  async isMemberOf(communityId: string, userId: string): Promise<boolean> {
    let user: any;
    if (orcidUtils.isValid(userId)) {
      user = await this.em.findOne(User, { orcid: userId as string }, [
        'personas',
      ]);
    } else if (uuidValidate(userId)) {
      user = await this.em.findOne(User, { uuid: userId as string }, [
        'personas',
      ]);
    }

    if (!user) {
      log.warn(`No such user ${communityId}`);
      return false;
    }

    const personas = await user.personas
      .getItems()
      .map(persona => persona.uuid);

    let community: any;
    if (uuidValidate(communityId)) {
      community = await this.findOne(
        {
          $and: [
            { uuid: communityId },
            { members: { uuid: { $in: personas } } },
          ],
        },
        ['members'],
      );
    } else {
      community = await this.findOne(
        {
          $and: [
            { slug: communityId },
            { members: { uuid: { $in: personas } } },
          ],
        },
        ['members'],
      );
    }

    return !!community;
  }

  async isOwnerOf(communityId: string, userId: string): Promise<boolean> {
    let community: any;
    if (uuidValidate(communityId)) {
      community = await this.findOne({ uuid: communityId }, ['owners']);
    } else {
      community = await this.findOne({ slug: communityId }, ['owners']);
    }

    if (!community) {
      log.warn(`No such community ${communityId}`);
      return false;
    }

    let user: any;
    if (orcidUtils.isValid(userId)) {
      user = await this.em.findOne(User, { orcid: userId as string });
    } else if (uuidValidate(userId)) {
      user = await this.em.findOne(User, { uuid: userId as string });
    }
    console.log('community:', community);
    console.log('user:', user);

    if (!user) return false;
    return community.owners.contains(user);
  }
}

export function communityModelWrapper(db: MikroORM): CommunityModel {
  return db.em.getRepository(Community);
}
