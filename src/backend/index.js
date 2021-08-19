import { createServer } from 'http';
import config from './config.ts';
import configServer from './server.js';

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
  .then(server =>
    console.log(`🚀 Server listening on port ${server.address().port}!`),
  )
  .catch(err => {
    setImmediate(() => {
      console.error(`Encountered error while running the app: ${err}`);
    });
  });
