import { join } from 'path'

import { createLogger, format } from "winston";
import { Console, File } from "winston/lib/winston/transports";

export const logger = createLogger({
    transports: [
        new Console({
            level: 'info',
            format: format.cli(),
        }),
        new Console({
            level: 'error',
            format: format.cli(),
        }),
        new File({
            dirname: join(process.cwd(), 'logs'),
            filename: 'debug.log',
            level: 'debug',
            format: format.simple(),
        }),
        new File({
            dirname: join(process.cwd(), 'logs'),
            filename: 'main.log',
            level: 'info',
            format: format.simple(),
        }),
        new File({
            dirname: join(process.cwd(), 'logs'),
            filename: 'errors.log',
            level: 'error',
            format: format.simple(),
        }),
    ]
})