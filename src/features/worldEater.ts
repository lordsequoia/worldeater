import { logger, printPlayerStatsActions } from "../helpers";
import { usePlayerStats, PlayerStatsFeature } from "./playerStats";
import { join } from 'path'
import { ServerLogsFeature, useServerLogs } from "./serverLogs";

export interface WorldEaterOpts {
    rootDir: string;
    levelName: string;
}

export type LogFn = (message: any) => void

export class WorldEater {
    options: WorldEaterOpts;
    playerStats: PlayerStatsFeature;
    serverLogs: ServerLogsFeature;

    info: LogFn;
    error: LogFn;
    debug: LogFn;
    warn: LogFn;

    constructor(options: WorldEaterOpts) {
        this.options = options

        this.info = (message: any) => logger.info(message)
        this.error = (message: any) => logger.error(message)
        this.debug = (message: any) => logger.debug(message)
        this.warn = (message: any) => logger.warn(message)

        this.serverLogs = useServerLogs(this)
        this.playerStats = usePlayerStats(this)

        printPlayerStatsActions(this.playerStats, this.debug)

        this.init()
    }

    filePath(path: any) {
        const subPath = typeof path !== 'string' && Array.isArray(path) ? path.join('/') : String(path)
        return join(this.options.rootDir, subPath)
    }

    levelPath(path: any) {
        const subPath = typeof path !== 'string' && Array.isArray(path) ? path.join('/') : String(path)

        return this.filePath(join(this.options.levelName, subPath))
    }

    synchronize() {
        this.info(`synchronizing world eater`)
        this.playerStats.synchronizeStats()
    }

    init() {
        this.info(`initializing world eater`)
        this.synchronize()
    }
}

export const useWorldEater = (rootDir: string, levelName: string) => new WorldEater({rootDir, levelName})