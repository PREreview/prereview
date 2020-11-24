import router from 'koa-joi-router';
// import { getLogger } from '../log.js';

// const log = getLogger('backend:controllers:fullReviewDrafts');
// const Joi = router.Joi;

export default function controller() {
  //drafts, thisUser
  const draftsRouter = router();

  return draftsRouter;
}
