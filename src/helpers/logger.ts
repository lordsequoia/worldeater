import { join } from 'path'

import * as winston from "winston";
import { Console, DailyRotateFile, File } from "winston/lib/winston/transports";
import  'winston-daily-rotate-file';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

export const logtail = new Logtail(process.env['LOGTAIL_TOKEN'] || '');

export const makeLogger = (service: string) => {
    const result = winston.createLogger({
        defaultMeta: {service},
        transports: [
            new Console({ level: 'info', format: winston.format.cli() }),
            new Console({ level: 'error', format: winston.format.cli() }),
            new DailyRotateFile({
                dirname: join(process.cwd(), 'logs'),
                filename: 'debug-%DATE%.log',
                level: 'debug',
                format: winston.format.simple(),
                datePattern: 'YYYY-MM-DD',
            }),
            new DailyRotateFile({
                dirname: join(process.cwd(), 'logs'),
                filename: 'main-%DATE%.log',
                level: 'info',
                format: winston.format.simple(),
                datePattern: 'YYYY-MM-DD',
            }),
            new File({
                dirname: join(process.cwd(), 'logs'),
                filename: 'errors.log',
                level: 'error',
                format: winston.format.simple(),
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