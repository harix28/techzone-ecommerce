const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const logger = require('./config/logger');
const { corsOptions } = require('./config/cors');
const { apiLimiter } = require('./middlewares/rate-limit');
const notFound = require('./middlewares/not-found');
const errorHandler = require('./middlewares/error-handler');
const routes = require('./routes');

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.use(
  morgan('dev', {
    skip: () => env.isProduction,
  }),
);

app.get('/api/health', async (req, res) => {
  res.json({
    success: true,
    data: {
      name: env.appName,
      environment: env.nodeEnv,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection', { error: error?.message, stack: error?.stack });
});

module.exports = app;
