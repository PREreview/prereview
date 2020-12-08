import { koaSwagger } from 'koa2-swagger-ui';
import { SwaggerAPI } from 'koa-joi-router-docs';
import preprintRoutes from '../controllers/preprint.js';
import { getLogger } from '../log.js';
import router from 'koa-joi-router';
import userRoutes from './user.js';
import fullReviewRoutes from './fullReview.js';
import commentRoutes from './comment.js';
import communityRoutes from './community.js';
import groupRoutes from './group.js';
import rapidReviewRoutes from './rapidReview.js';
import requestRoutes from './request.js';
import searchesRoutes from './searches.js';
import tagRoutes from './tag.js';

const log = getLogger('apiDocs:::');

export default function docs(authz) {
  const routes = router();
  const generator = new SwaggerAPI();

  generator.addJoiRouter(preprintRoutes({}, authz));
  generator.addJoiRouter(userRoutes({}, authz));
  generator.addJoiRouter(fullReviewRoutes({}, authz));
  generator.addJoiRouter(groupRoutes({}, authz));
  generator.addJoiRouter(commentRoutes({}, authz));
  generator.addJoiRouter(communityRoutes({}, authz));
  generator.addJoiRouter(rapidReviewRoutes({}, authz));
  generator.addJoiRouter(requestRoutes({}, authz));
  generator.addJoiRouter(searchesRoutes({}, authz));
  generator.addJoiRouter(tagRoutes({}, authz));

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
