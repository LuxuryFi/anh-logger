const logger = require('../');

const loggerInstance = new logger(
  {
    correlationIdNamespace: 'cls-correlation-id',
    correlationIdName: 'cls-correlation-id',
    level: 'debug',
  },
);

module.exports = loggerInstance;
