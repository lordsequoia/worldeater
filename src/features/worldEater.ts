import { logger, printPlayerStatsActions } from "../helpers";
import { usePlayerStats, PlayerStatsFeature } from "./playerStats";
import { join } from 'path'

export interface WorldEaterOpts {
    rootDir: string;
    levelName: string;
}

export type LogFn = (message: any) => void

export class WorldEater {
    options: WorldEaterOpts;
    playerStats: PlayerStatsFeature;

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

        this.playerStats = usePlayerStats(this)
        printPlayerStatsActions(this.playerStats, this.debug)

        this.init()
    }

    filePath(path: string | string[]) {
        return join(this.options.rootDir, Array.isArray(path) ? join(...path) : path)
    }

    levelPath(path: string | string[]) {
        const levelFile = Array.isArray(path) ? join(...path) : path
        return this.filePath([this.options.levelName, levelFile])
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