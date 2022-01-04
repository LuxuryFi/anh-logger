# Logger

## Quick Start

Check out the [quick start example][quick-example] in `./examples/`. 

## Usage

``` js
const logger = require('logger');
const config = require('../config/config');

const loggerInstance = new logger(
  {
    correlationIdNamespace: config.cls.correlationIdNamespace,
    correlationIdName: config.cls.correlationIdName,
    level: 'debug',
  },
);

module.exports = loggerInstance;
```

## Logging

Logging levels in `logger` conform to the severity ordering specified by
[RFC5424]: _severity of all levels is assumed to be numerically **ascending**
from most important to least important._

``` js
const levels = { 
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};
```

## Methods
```
{ 
  error
  warn 
  info 
  verbose 
  debug 
  silly 
}
```
