/* eslint-disable */
import { SwaggerAPI } from 'koa-joi-router-docs';
import router from 'koa-joi-router';
import preprintRoutes from '../controllers/preprint.js';
import groupRoutes from '../controllers/group.js';
import userRoutes from '../controllers/user.js';
import prereviewRoutes from '../controllers/prereview.js';

export default function docs() {
  const generator = new SwaggerAPI();
  generator.addJoiRouter(preprintRoutes);
  generator.addJoiRouter(groupRoutes);
  generator.addJoiRouter(userRoutes);
  generator.addJoiRouter(prereviewRoutes);
  const spec = generator.generateSpec();

  const specJson = JSON.stringify(spec, null, 2);

  const docsRouter = router();

  docsRouter.get('/apiDocs', async ctx => {
    ctx.body = specJson;
  });

  return docsRouter;
}
