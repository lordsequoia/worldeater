import { makeLogger, useWorldEater, WorldEaterOpts } from "../index";
import {join} from 'path'

const logger = makeLogger('app')

const setup = ({rootDir, levelName, socketHost, socketPort}: WorldEaterOpts) => useWorldEater(
    rootDir,
    levelName,
    socketHost,
    socketPort
)

export function launch (options: WorldEaterOpts) {
    logger.info(`launching app: ${options.rootDir}`)

    const app = setup(options)

    logger.info(`app launched: ${app.options.rootDir}!`)

    const webroot = join(process.cwd(), 'public')

    app.server.get('/', (_req, res) => {
        res.sendFile(join(webroot, 'index.html'))
    })

    app.server.get('/status', (_req, res) => {
        res.json({hello: options.rootDir})
    })

    app.server.get('/stats', (_req, res) => {
        res.json({stats: app.playerStats.$stats.getState()})
    })

    app.init()

    return {logger, app, webroot}
}