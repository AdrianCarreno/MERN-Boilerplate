import config from 'config'
import fs from 'fs'
import path from 'path'
import winston from 'winston'
import winstonDaily from 'winston-daily-rotate-file'

// logs dir
const logDir: string = path.join(__dirname, config.get('log.dir'))

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir)
}

// Colors array to use in the log
const colors = {
    error: '\x1b[31m',
    warn: '\x1b[33m',
    info: '\x1b[32m',
    http: '\x1b[34m',
    verbose: '\x1b[35m',
    debug: '\x1b[36m',
    silly: '\x1b[37m'
}

// Define log format
const logFormat = winston.format.printf(
    ({ timestamp, level, message }) => `${timestamp} ${colors[level]}${level}\x1b[39m: ${message}`
)

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        logFormat
    ),
    transports: [
        // debug log setting
        new winstonDaily({
            level: 'debug',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/debug', // log file /logs/debug/*.log in save
            filename: `%DATE%.log`,
            maxFiles: 30, // 30 Days saved
            json: false,
            zippedArchive: true
        }),
        // error log setting
        new winstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/error', // log file /logs/error/*.log in save
            filename: `%DATE%.log`,
            maxFiles: 30, // 30 Days saved
            handleExceptions: true,
            json: false,
            zippedArchive: true
        })
    ]
})

logger.add(
    new winston.transports.Console({
        format: winston.format.combine(winston.format.splat(), winston.format.colorize())
    })
)

const stream = {
    write: (message: string) => {
        logger.info(message.substring(0, message.lastIndexOf('\n')))
    }
}

export { logger, stream }
