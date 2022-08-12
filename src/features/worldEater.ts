import { usePlayerStats, PlayerStatsFeature } from "./playerStats";

export interface WorldEaterOpts {
    rootDir: string;
    levelName: string;
}

export class WorldEater {
    options: WorldEaterOpts;
    playerStats: PlayerStatsFeature;

    constructor(options: WorldEaterOpts) {
        this.options = options

        this.playerStats = usePlayerStats(this.options)
    }

    init() {
        this.playerStats.synchronizeStats()
    }
}

export const useWorldEater = (rootDir: string, levelName: string) => (new WorldEater({rootDir, levelName}))