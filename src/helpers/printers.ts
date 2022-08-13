import { LogFn } from ".."
import { PlayerStatsFeature } from "../features/playerStats"

export const printPlayerStatsActions = ({
    $length,
    loadAllStatsFx,
    patch,
    synchronizeStats,
}: PlayerStatsFeature, log: LogFn) => {
    $length.watch(v => log(`loaded player stats: ${v}`))
    // updateAllStatsFx.watch(v => log(`updating ${Object.keys(v).length} player stats files`))   
    loadAllStatsFx.watch(v => log(`loading player stats from ${v}`))
    synchronizeStats.watch(() => log(`synchronizing player stats`))
    patch.watch(v => log(`set player stats for ${v.uuid}: ${Object.keys(v.stats).join(', ')}`))
}