import { SwaggerAPI } from 'koa-joi-router-docs';
import preprintRoutes from '../controllers/preprint';
import authWrapper from '../middleware/auth';
import userRoutes from '../controllers/user';
import fullReviewRoutes from '../controllers/fullReview';
import commentRoutes from '../controllers/comment';
import badgeRoutes from '../controllers/badge';
import expertiseRoutes from '../controllers/expertise';
import communityRoutes from '../controllers/community';
import eventRoutes from '../controllers/event';
import groupRoutes from '../controllers/group';
import personaRoutes from '../controllers/persona';
import rapidReviewRoutes from '../controllers/rapidReview';
import reportRoutes from '../controllers/report';
import requestRoutes from '../controllers/request';
import tagRoutes from '../controllers/tag';
import templateRoutes from '../controllers/template';
import notificationRoutes from '../controllers/notification';

function docs() {
  const generator = new SwaggerAPI();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stub: any = {}
  const authz = authWrapper(stub, stub, stub, stub); // authorization, not authentication

  generator.addJoiRouter(preprintRoutes(stub, authz));
  generator.addJoiRouter(userRoutes(stub, stub, stub, stub, authz));
  generator.addJoiRouter(fullReviewRoutes(stub, stub, stub, stub, stub, stub, authz));
  generator.addJoiRouter(eventRoutes(stub, authz));
  generator.addJoiRouter(groupRoutes(stub, stub, authz));
  generator.addJoiRouter(commentRoutes(stub, stub, authz));
  generator.addJoiRouter(badgeRoutes(stub, authz));
  generator.addJoiRouter(expertiseRoutes(stub, authz));
  generator.addJoiRouter(communityRoutes(stub, stub, stub, stub, stub, authz));
  generator.addJoiRouter(personaRoutes(stub, stub, stub, stub, authz));
  generator.addJoiRouter(rapidReviewRoutes(stub, stub, authz));
  generator.addJoiRouter(reportRoutes(stub, stub, stub, stub, stub, authz));
  generator.addJoiRouter(requestRoutes(stub, stub, authz));
  generator.addJoiRouter(tagRoutes(stub, authz));
  generator.addJoiRouter(templateRoutes(stub, stub, authz));
  generator.addJoiRouter(notificationRoutes(stub, authz));

  const spec = generator.generateSpec(
    {
      info: {
        title: 'PREreview API',
        description: 'Review preprints & build community',
        version: '2.0',
      },
      basePath: '/api/v2',
      tags: [],
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
  process.stdout.write(specJson);
}

docs();
