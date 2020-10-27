import { SwaggerAPI } from 'koa-joi-router-docs';
import preprintRoutes from '../controllers/preprint.js';
import groupRoutes from '../controllers/group.js';
import userRoutes from '../controllers/user.js';
import prereviewRoutes from '../controllers/prereview.js';

const generator = new SwaggerAPI();
generator.addJoiRouter(preprintRoutes);
const spec = generator.generateSpec();

const preprintsSpec = JSON.stringify(spec, null, 2);
