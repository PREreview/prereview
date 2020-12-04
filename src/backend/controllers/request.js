import router from 'koa-joi-router';
// import { getLogger } from '../log.js';

// const log = getLogger('backend:controllers:tags');
// const Joi = router.Joi;

export default function controller() {
  const requestRouter = router();

  return requestRouter;
}
