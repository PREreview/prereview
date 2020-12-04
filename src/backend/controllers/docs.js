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
import rapidRoutes from './rapidReview.js';
import requestRoutes from './request.js';
import tagRouter from './tag.js';
import {
  commentModelWrapper,
  communityModelWrapper,
  fullReviewModelWrapper,
  fullReviewDraftModelWrapper,
  groupModelWrapper,
  personaModelWrapper,
  preprintModelWrapper,
  rapidReviewModelWrapper,
  requestModelWrapper,
  tagModelWrapper,
  userModelWrapper,
} from '../models/index.ts';

const log = getLogger('apiDocs:::');

export default function docs(authz) {
  const routes = router();
  const generator = new SwaggerAPI();

  generator.addJoiRouter(preprintRoutes(preprintModelWrapper, authz));
  generator.addJoiRouter(userRoutes(userModelWrapper, authz));
  generator.addJoiRouter(
    fullReviewRoutes(
      fullReviewModelWrapper,
      fullReviewDraftModelWrapper,
      personaModelWrapper,
      preprintModelWrapper,
      authz,
    ),
  );
  generator.addJoiRouter(groupRoutes(groupModelWrapper, authz));
  generator.addJoiRouter(commentRoutes(commentModelWrapper, authz));
  generator.addJoiRouter(communityRoutes(communityModelWrapper, authz));
  generator.addJoiRouter(rapidRoutes(rapidReviewModelWrapper, authz));
  generator.addJoiRouter(requestRoutes(requestModelWrapper, authz));
  generator.addJoiRouter(tagRouter(tagModelWrapper, authz));

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
