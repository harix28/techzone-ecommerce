const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/config/logger');
const { testConnection } = require('./src/config/database');

if (process.env.VERCEL !== '1') {
  testConnection()
    .then(() => {
      app.listen(env.port, () => {
        logger.info(`${env.appName} listening`, { port: env.port, environment: env.nodeEnv });
      });
    })
    .catch((error) => {
      logger.error('Failed to connect to MySQL', { message: error.message, stack: error.stack });
      process.exit(1);
    });
}

module.exports = app;
