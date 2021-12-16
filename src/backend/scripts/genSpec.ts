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
  const authz = authWrapper({}, {}, {}, {}); // authorization, not authentication

  generator.addJoiRouter(preprintRoutes({}, authz));
  generator.addJoiRouter(userRoutes({}, {}, {}, authz));
  generator.addJoiRouter(fullReviewRoutes({}, {}, {}, {}, {}, authz));
  generator.addJoiRouter(eventRoutes({}, authz));
  generator.addJoiRouter(groupRoutes({}, {}, authz));
  generator.addJoiRouter(commentRoutes({}, {}, authz));
  generator.addJoiRouter(badgeRoutes({}, authz));
  generator.addJoiRouter(expertiseRoutes({}, authz));
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
