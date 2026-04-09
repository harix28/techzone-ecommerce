const formatMeta = (meta) => {
  if (!meta || Object.keys(meta).length === 0) {
    return '';
  }

  try {
    return ` ${JSON.stringify(meta)}`;
  } catch (error) {
    return ` ${String(meta)}`;
  }
};

const write = (level, message, meta = {}) => {
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}${formatMeta(meta)}`;

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
};

module.exports = {
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta),
  debug: (message, meta) => write('debug', message, meta),
};
