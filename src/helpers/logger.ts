import { join } from 'path'

import * as winston from "winston";
import { Console, DailyRotateFile } from "winston/lib/winston/transports";
import  'winston-daily-rotate-file';

export const logger = winston.createLogger({
    transports: [
        new Console({ level: 'info', format: winston.format.cli() }),
        new Console({ level: 'error', format: winston.format.cli() }),
        new DailyRotateFile({
            dirname: join(process.cwd(), 'logs'),
            filename: 'debug-%DATE%.log',
            level: 'debug',
            format: winston.format.simple(),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        }),
        new DailyRotateFile({
            dirname: join(process.cwd(), 'logs'),
            filename: 'main-%DATE%.log',
            level: 'info',
            format: winston.format.simple(),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        }),
        new DailyRotateFile({
            dirname: join(process.cwd(), 'logs'),
            filename: 'errors-%DATE%.log',
            level: 'error',
            format: winston.format.simple(),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        }),
    ]
})