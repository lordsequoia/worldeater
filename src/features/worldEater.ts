import { logger, watchDir } from "../helpers";
import { usePlayerStats, PlayerStatsFeature } from "./playerStats";
import { join } from 'path'
import { ServerLogsFeature, useServerLogs } from "./serverLogs";
import { SocketsFeature, useSockets } from "./ioSockets";
import { createEffect, Effect } from "effector";
import winston from "winston";

export interface WorldEaterOpts {
    rootDir: string;
    levelName: string;
}

export type LogFn = (message: any) => void
export type LoggerFx = Effect<any, winston.Logger, Error>

export class WorldEater {
    options: WorldEaterOpts;
    storage: ReturnType<typeof watchDir>
    playerStats: PlayerStatsFeature;
    serverLogs: ServerLogsFeature;
    sockets: SocketsFeature;

    info: LoggerFx;
    error: LoggerFx;
    debug: LoggerFx;
    warn: LoggerFx;

    constructor(options: WorldEaterOpts) {
        this.options = options

        this.info = createEffect((message: any) => logger.info(message))
        this.error = createEffect((message: any) => logger.error(message))
        this.debug = createEffect((message: any) => logger.debug(message))
        this.warn = createEffect((message: any) => logger.warn(message))

        this.sockets = useSockets(this)

        this.info.watch(message => this.sockets.ioServer.emit('info', message))

        this.storage = watchDir(options.rootDir)
        this.serverLogs = useServerLogs(this)
        this.playerStats = usePlayerStats(this)
    }

    filePath(path: any) {
        return join(this.options.rootDir, String(path))
    }

    levelPath(path: any) {
        return join(this.options.rootDir, this.options.levelName, String(path))
    }

    synchronize() {
        logger.info(`synchronizing world eater`)
        
        // this.playerStats.loadStats()
    }

    init() {
        logger.info(`initializing world eater`)

        this.sockets.ioServer.on('connection', (socket) => {
            logger.info(`[io:server] new socket connected: ${socket.id}`)

        })

        this.info.watch(v => this.sockets.ioServer/*.to('app logs')*/.emit('info', v))

        this.storage.startWatching()
    }
}

export const useWorldEater = (rootDir: string, levelName: string) => new WorldEater({rootDir, levelName})