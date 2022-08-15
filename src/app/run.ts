import { makeLogger, useWorldEater, WorldEaterOpts } from "../index";
import {join} from 'path'

export function launch ({rootDir, levelName, socketHost, socketPort}: WorldEaterOpts) {
    const logger = makeLogger('app')

    logger.info(`launching!`)

    const app = useWorldEater(
        rootDir,
        levelName,
        socketHost,
        socketPort
    )

    logger.info(`app launched: ${app.options.rootDir}!`)

    const webroot = join(process.cwd(), 'public')
    
    app.server.get('/', (_req, res) => {
        res.sendFile(join(webroot, 'index.html'))
    })

    app.server.get('/status', (_req, res) => {
        res.json({hello: rootDir})
    })

    return {logger, app}
}