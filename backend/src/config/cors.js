const env = require('./env');

const localHosts = new Set(['localhost', '127.0.0.1']);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (env.corsOrigins.includes(origin)) {
    return true;
  }

  if (!env.isProduction) {
    try {
      const { hostname } = new URL(origin);
      return localHosts.has(hostname);
    } catch (error) {
      return false;
    }
  }

  return false;
};

module.exports = {
  corsOptions: {
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  },
};
