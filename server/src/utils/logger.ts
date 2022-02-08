import { dir } from '@configs/log'
import fs from 'fs'
import path from 'path'
import winston from 'winston'
import WinstonDaily from 'winston-daily-rotate-file'

// logs dir
const logDir: string = path.join(__dirname, dir)

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir)
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
)

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
    transports: [
        // debug log setting
        new WinstonDaily({
            level: 'debug',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/debug', // log file /logs/debug/*.log in save
            filename: `%DATE%.log`,
            maxFiles: 30, // 30 Days saved
            json: false,
            zippedArchive: true,
            format: logFormat
        }),
        // error log setting
        new WinstonDaily({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir + '/error', // log file /logs/error/*.log in save
            filename: `%DATE%.log`,
            maxFiles: 30, // 30 Days saved
            handleExceptions: true,
            json: false,
            zippedArchive: true,
            format: logFormat
        }),
        new winston.transports.Console({
            format: winston.format.combine(winston.format.splat(), winston.format.colorize(), logFormat)
        })
    ]
})

const stream = {
    write: (message: string) => {
        logger.info(message.substring(0, message.lastIndexOf('\n')))
    }
}

export { logger, stream }
