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
import tagRoutes from './tag.js';

const log = getLogger('apiDocs:::');

export default function docs() {
  const routes = router();
  const generator = new SwaggerAPI();

  generator.addJoiRouter(preprintRoutes());
  generator.addJoiRouter(userRoutes());
  generator.addJoiRouter(fullReviewRoutes());
  generator.addJoiRouter(groupRoutes());
  generator.addJoiRouter(commentRoutes());
  generator.addJoiRouter(communityRoutes());
  generator.addJoiRouter(tagRoutes());

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
