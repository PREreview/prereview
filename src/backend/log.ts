import log4js, { Logger } from 'koa-log4';
import config from './config';

export function getLogger(namespace: string): Logger {
  // Configure logging
  log4js.configure({
    appenders: { console: { type: 'stdout', layout: { type: 'colored' } } },
    categories: {
      default: { appenders: ['console'], level: config.logLevel },
    },
  });
  return log4js.getLogger(namespace);
}
