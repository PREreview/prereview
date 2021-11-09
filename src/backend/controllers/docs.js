import { koaSwagger } from 'koa2-swagger-ui';
import { SwaggerAPI } from 'koa-joi-router-docs';
import preprintRoutes from '../controllers/preprint';
import { getLogger } from '../log.ts';
import router from 'koa-joi-router';
import userRoutes from './user';
import fullReviewRoutes from './fullReview';
import commentRoutes from './comment';
import badgeRoutes from './badge';
import expertiseRoutes from './expertise';
import communityRoutes from './community';
import eventRoutes from './event';
import groupRoutes from './group';
import personaRoutes from './persona';
import rapidReviewRoutes from './rapidReview';
import reportRoutes from '../controllers/report';
import requestRoutes from './request';
import tagRoutes from './tag';
import templateRoutes from './template';
import notificationRoutes from '../controllers/notification';

const log = getLogger('apiDocs:::');

export default function docs(authz) {
  const routes = router();
  const generator = new SwaggerAPI();

  generator.addJoiRouter(preprintRoutes({}, authz));
  generator.addJoiRouter(userRoutes({}, {}, {}, authz));
  generator.addJoiRouter(fullReviewRoutes({}, {}, {}, {}, {}, authz));
  generator.addJoiRouter(eventRoutes({}, authz));
  generator.addJoiRouter(badgeRoutes({}, authz));
  generator.addJoiRouter(expertiseRoutes({}, authz));
  generator.addJoiRouter(groupRoutes({}, {}, authz));
  generator.addJoiRouter(commentRoutes({}, {}, authz));
  generator.addJoiRouter(communityRoutes({}, {}, {}, {}, {}, authz));
  generator.addJoiRouter(personaRoutes({}, {}, {}, {}, authz));
  generator.addJoiRouter(rapidReviewRoutes({}, {}, authz));
  generator.addJoiRouter(reportRoutes({}, {}, {}, {}, {}, authz));
  generator.addJoiRouter(requestRoutes({}, {}, authz));
  generator.addJoiRouter(tagRoutes({}, authz));
  generator.addJoiRouter(templateRoutes({}, {}, authz));
  generator.addJoiRouter(notificationRoutes({}, authz));

  const spec = generator.generateSpec(
    {
      info: {
        title: 'PREreview API',
        description: 'Review preprints & build community',
        version: '2.0',
      },
      basePath: '/api/v2',
    },
    {
      defaultResponses: {
        200: {
          description: 'OK',
        },
        500: {
          description: 'ERROR',
        },
      }, // Custom default responses if you don't like default 200
    },
  );

  const specJson = JSON.stringify(spec, null, 2);

  routes.get('/openapi.json', async ctx => {
    log.debug(`Serving OpenAPI-specified docs in JSON format.`);
    ctx.body = specJson;
  });

  routes.get(
    '/docs',
    koaSwagger({
      routePrefix: false,
      swaggerOptions: { spec },
    }),
  );

  return routes;
}
