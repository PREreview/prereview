import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:notifications');
const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
const querySchema = Joi.object({
  start: Joi.number()
    .integer()
    .greater(-1),
  end: Joi.number()
    .integer()
    .positive(),
  asc: Joi.boolean(),
  sort_by: Joi.string(),
  from: Joi.string(),
  to: Joi.string(),
});

export default function controller(
  userModel,
  // eslint-disable-next-line no-unused-vars
  thisUser,
) {
  const notificationsRouter = router();

  // handler for GET multiple reviews methods
  const getHandler = async ctx => {
    let user;
    try {
      user = await userModel.findOneByUuidOrOrcid(ctx.params.uid, [
        'personas.invitedToAuthor.preprint',
        'personas.invitedToMentor.preprint',
      ]);
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    const invites = user.personas.toArray().reduce((invites, persona) => {
      persona.invitedToAuthor.forEach(invite => {
        invites.push({
          preprint: invite.uuid,
          title: invite.preprint.title,
          persona: persona.uuid,
          role: 'authors',
        });
      });
      persona.invitedToMentor.forEach(invite => {
        invites.push({
          preprint: invite.uuid,
          title: invite.preprint.title,
          persona: persona.uuid,
          role: 'mentors',
        });
      });
      return invites;
    }, []);

    ctx.body = {
      status: 200,
      message: 'ok',
      data: invites,
    };
    ctx.status = 200;
  };

  notificationsRouter.route({
    method: 'GET',
    path: '/notifications/:uid',
    handler: async ctx => getHandler(ctx),
    meta: {
      swagger: {
        operationId: 'GetUserNotifications',
        summary:
          'Endpoint to GET all notifications for a specific user. If successful, returns a 200 and an array of notifications in the `data` property of the response body.',
      },
    },
  });

  return notificationsRouter;
}
