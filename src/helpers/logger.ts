import { join } from 'path'

import * as winston from "winston";
import { Console, DailyRotateFile, File } from "winston/lib/winston/transports";
import  'winston-daily-rotate-file';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

export const logtail = new Logtail(process.env['LOGTAIL_TOKEN'] || '');

export const makeLogger = (name: string) => {
    const result = winston.createLogger({
        transports: [
            new Console({ level: 'info', format: winston.format.cli() }),
            new Console({ level: 'error', format: winston.format.cli() }),
            new DailyRotateFile({
                dirname: join(process.cwd(), 'logs', name, 'debug'),
                filename: '%DATE%.log',
                level: 'debug',
                format: winston.format.simple(),
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d'
            }),
            new DailyRotateFile({
                dirname: join(process.cwd(), 'logs', name, 'info'),
                filename: '%DATE%.log',
                level: 'info',
                format: winston.format.simple(),
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d'
            }),
            new File({
                dirname: join(process.cwd(), 'logs', name),
                filename: 'errors.log',
                level: 'error',
                format: winston.format.simple(),
                zippedArchive: true,
            }),
            new LogtailTransport(logtail, {
                level: 'info',
                format: winston.format.simple(),
            }),
        ]
    })
    
    return result
}

export const logger = makeLogger('worldeater')