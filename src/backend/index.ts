import { createServer } from 'http';
import config from './config';
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
  return createServer(await configServer(config)).listen(config.port);
}

bootstrap()
  .then(() => console.log(`Server started`))
  .catch(err => {
    setImmediate(() => {
      console.error(`Encountered error while running the app: ${err}`);
    });
  });
