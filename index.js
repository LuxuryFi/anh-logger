/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-destructuring */
const path = require('path');
const uuid = require('uuid/v4');
const cls = require('cls-hooked');
const winston = require('winston');

this.stackData = {};

let correlationIdNamespace;
let correlationIdName;

/**
 * Get correlation id from cls and set it as a part of winston info object.
 * @returns {Object}
 */
const addCorrelationIdContext = winston.format.printf((info) => {
  const infoData = {};
  try {
    const correlationId = cls.getNamespace(correlationIdNamespace).get(correlationIdName);
    infoData.correlationId = !correlationId ? uuid() : correlationId;
  } catch (e) {
    this.correlationId = uuid();
  }
  return Object.assign(info, infoData);
});

/**
 * Create logger instance
 */
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'stack'] }),
    addCorrelationIdContext,
    winston.format.printf(info => JSON.stringify({
      microservices: {
        level: info.level,
        correlationId: info.correlationId,
        timestamp: info.timestamp,
        script: this.stackData.script,
        action: this.stackData.action,
        message: info.message,
        payload: info.metadata,
      },
    })),
  ),
  transports: [
    new winston.transports.Console({ handleExceptions: true }),
  ],
});

/**
 * Parses and returns info about the call stack.
 * @returns {Object}
 */
const getStackInfo = () => {
  const stackList = (new Error()).stack.split('\n').slice(3);

  // Regex to parse node stack call
  const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
  const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

  const stackString = stackList[1] || stackList[0];
  const stackArray = stackReg.exec(stackString) || stackReg2.exec(stackString);

  if (stackArray && stackArray.length === 5) {
    return {
      action: stackArray[1],
      script: `${path.relative('src', stackArray[2])}:${stackArray[3]}`,
    };
  }
  return {};
};

/**
 * Get stack trace info and set it to logger instance.
 * @param {Object} args - Arguments from logger instance.
 * @returns {Object}
 */
const trace = (args) => {
  try {
    this.stackData = getStackInfo();
  } catch (e) {
    this.stackData = {};
  }
  return args;
};

class Logger {
  constructor(config) {
    // if (config === undefined || config.correlationIdNamespace === undefined || config.correlationIdName === undefined || config.level === undefined) {
    //   throw new Error('Wrong config.');
    // }
    // ensure singleton
    // check if a logger instance exists. prevents clashing with logger in audit-logger
    if (Logger.instance) {
      return Logger.instance;
    }

    correlationIdNamespace = config.correlationIdNamespace;
    correlationIdName = config.correlationIdName;
    logger.level = config.level;
    Logger.instance = this;

    return this;
  }

  error(...args) {
    const { error } = logger;
    error.apply(logger, trace(args));
  }

  warn(...args) {
    const { warn } = logger;
    warn.apply(logger, trace(args));
  }

  info(...args) {
    const { info } = logger;
    info.apply(logger, trace(args));
  }

  verbose(...args) {
    const { verbose } = logger;
    verbose.apply(logger, trace(args));
  }

  debug(...args) {
    const { debug } = logger;
    debug.apply(logger, trace(args));
  }

  silly(...args) {
    const { silly } = logger;
    silly.apply(logger, trace(args));
  }
}

module.exports = Logger;
