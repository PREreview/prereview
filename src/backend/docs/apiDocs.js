import { SwaggerAPI } from 'koa-joi-router-docs';
import preprintRoutes from '../controllers/preprint.js'
import GroupController from './controllers/group.js';
import UserController from './controllers/user.js';
import PreprintController from './controllers/preprint.js';
import PrereviewController from './controllers/prereview.js';

const generator = new SwaggerAPI()
generator.addJoiRouter(preprintRoutes)
const spec = generator.generateSpec()

const preprintsSpec = JSON.stringify(spec, null, 2)


