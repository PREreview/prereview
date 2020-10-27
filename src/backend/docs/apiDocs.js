import { SwaggerAPI } from 'koa-joi-router-docs';
import preprintRoutes from '../controllers/preprint.js';
import { getLogger } from '../log.js';
import router from 'koa-joi-router';
import userRoutes from '../controllers/user.js';
import prereviewRoutes from '../controllers/prereview.js';
import commentRoutes from '../controllers/comment.js';
import groupRoutes from '../controllers/group.js';

const log = getLogger('apiDocs:::');

export default function docs() {
  const routes = router();
  const generator = new SwaggerAPI();

  generator.addJoiRouter(preprintRoutes());
  generator.addJoiRouter(userRoutes());
  generator.addJoiRouter(prereviewRoutes());
  generator.addJoiRouter(groupRoutes());
  generator.addJoiRouter(commentRoutes());

  const spec = generator.generateSpec(
    {
      info: {
        title: 'PREreview API',
        description: 'Review preprints & build community',
        version: '2.0',
      },
      basePath: '/',
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
    log.debug('...in the API docs...');
    ctx.body = specJson;
  });

  routes.get('/docs', async ctx => {
    ctx.body = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Example API</title>
    </head>
    <body>
      <redoc spec-url='/api/v2/openapi.json' lazy-rendering></redoc>
      <script src="https://rebilly.github.io/ReDoc/releases/latest/redoc.min.js"></script>
    </body>
    </html>
    `;
  });

  return routes;
}
