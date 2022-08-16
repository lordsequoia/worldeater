import { logger, watchDir } from "../helpers";
import { usePlayerStats, PlayerStatsFeature } from "./playerStats";
import { join } from 'path'
import { ServerLogsFeature, useServerLogs } from "./serverLogs";
import { SocketsFeature, useSockets } from "./ioSockets";
import { createEffect, Effect } from "effector";
import winston from "winston";
import { MemberListFeature, useMemberList } from "./membersList";

export interface WorldEaterOpts {
    rootDir: string;
    levelName: string;
    socketHost: string;
    socketPort: number;
}

export type LogFn = (message: any) => void
export type LoggerFx = Effect<any, winston.Logger, Error>

export class WorldEater {
    options: WorldEaterOpts;
    storage: ReturnType<typeof watchDir>
    playerStats: PlayerStatsFeature;
    serverLogs: ServerLogsFeature;
    members: MemberListFeature['members$'];
    http: ReturnType<SocketsFeature['createServer']>['httpServer'];
    server: ReturnType<SocketsFeature['createServer']>['httpApp'];
    ioServer: ReturnType<SocketsFeature['createServer']>['ioServer'];

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

        const {createServer} = useSockets({
            host: options.socketHost,
            port: options.socketPort
        })

        const server = createServer()
        this.http = server.httpServer
        this.ioServer = server.ioServer
        this.server = server.httpApp

        this.info.watch(message => this.ioServer.emit('info', message))

        const storage = watchDir(options.rootDir)
        this.storage = storage

        const {members$} = useMemberList(this)
        this.members = members$

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

        this.ioServer.on('connection', (socket) => {
            logger.info(`[io:server] new socket connected: ${socket.id}`)

        })

        this.info.watch(v => this.ioServer/*.to('app logs')*/.emit('info', v))

        this.storage.startWatching()
    }
}

export const useWorldEater = (rootDir: string, levelName: string, socketHost?: string, socketPort?:number) => new WorldEater({
    rootDir,
    levelName,
    socketHost: socketHost || '0.0.0.0',
    socketPort: socketPort || 3082
})