import { MikroORM } from '@mikro-orm/core';
import { createServer } from 'http';
import config from './config';
import ormConfig from './mikro-orm.config';
import configServer from './server';

/**
 * Function to start up the app.
 */
async function bootstrap() {
  /**
   * Add external services init as async operations (db, redis, etc...)
   * e.g.
   * await sequelize.authenticate()
   */
  config.parse(process.argv);
  const orm = await MikroORM.init(ormConfig);
  return createServer(await configServer(orm, config)).listen(config.port);
}

bootstrap()
  .then(() => console.log(`Server started`))
  .catch(err => {
    setImmediate(() => {
      console.error(`Encountered error while running the app: ${err}`);
    });
  });
