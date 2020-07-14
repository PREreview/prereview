import figlet from 'figlet';
import { createServer } from 'http';
import server from './server.js';
import config from './config.js';
import { ServerError } from '../common/errors.js';

/**
 * Function to start up application.
 */
async function bootstrap() {
  /**
   * Add external services init as async operations (db, redis, etc...)
   * e.g.
   * await sequelize.authenticate()
   */
  return createServer(server.callback()).listen(config.server.port);
}

/* eslint-disable no-useless-escape */
bootstrap()
  .then(async server => {
    figlet.text(
      process.env.npm_package_name,
      {
        font: 'Sub-Zero',
      },
      function(err, bigName) {
        if (err) {
          console.error('Something went wrong...');
          console.error(err);
          return;
        }
        console.log(`
${bigName}
🚀 Server listening on port ${server.address().port}!`);
        return;
      },
    );
    return;
  })
  .catch(err => {
    setImmediate(() => {
      throw new ServerError(
        'Unable to run the server because of the following error',
        err,
      );
    });
  });
/* eslint-enable no-useless-escape */
