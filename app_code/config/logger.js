var winston = require('winston');
var winstonLogger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({
            filename: 'winston.log'
        }),
        new winston.transports.Console()
    ]
});

winstonLogger.info('Winston: the logs are being captured 2 ways- console and in winston.log.');

module.exports = winstonLogger;