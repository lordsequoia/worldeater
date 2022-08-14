import { logger, watchDir } from "../helpers";
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
    storage: ReturnType<typeof watchDir>
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

        this.storage = watchDir(this.options.rootDir)
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
        this.info(`synchronizing world eater`)
        
        // this.playerStats.loadStats()
    }

    init() {
        this.info(`initializing world eater`)

        this.storage.startWatching()
    }
}

export const useWorldEater = (rootDir: string, levelName: string) => new WorldEater({rootDir, levelName})