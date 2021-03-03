import fs from 'fs';
import path from 'path';
import { SwaggerAPI } from 'koa-joi-router-docs';
import preprintRoutes from '../controllers/preprint.js';
import authWrapper from '../middleware/auth.js';
import userRoutes from '../controllers/user.js';
import fullReviewRoutes from '../controllers/fullReview.js';
import commentRoutes from '../controllers/comment.js';
import communityRoutes from '../controllers/community.js';
import eventRoutes from '../controllers/event.js';
import groupRoutes from '../controllers/group.js';
import personaRoutes from '../controllers/persona.js';
import rapidReviewRoutes from '../controllers/rapidReview.js';
import reportRoutes from '../controllers/report.js';
import requestRoutes from '../controllers/request.js';
import tagRoutes from '../controllers/tag.js';
import templateRoutes from '../controllers/template.js';
import notificationRoutes from '../controllers/notification.js';

const __dirname = path.resolve();
const OUT_FILE = path.resolve(__dirname, 'dist', 'openapi.json');

function docs() {
  const generator = new SwaggerAPI();
  const authz = authWrapper({}); // authorization, not authentication

  generator.addJoiRouter(preprintRoutes({}, authz));
  generator.addJoiRouter(userRoutes({}, {}, authz));
  generator.addJoiRouter(fullReviewRoutes({}, {}, {}, {}, {}, authz));
  generator.addJoiRouter(eventRoutes({}, authz));
  generator.addJoiRouter(groupRoutes({}, {}, authz));
  generator.addJoiRouter(commentRoutes({}, {}, authz));
  generator.addJoiRouter(communityRoutes({}, {}, {}, {}, authz));
  generator.addJoiRouter(personaRoutes({}, {}, authz));
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
  fs.writeFileSync(OUT_FILE, specJson);
}

docs();
