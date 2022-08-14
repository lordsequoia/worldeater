import { LogFn } from ".."
import { PlayerStatsFeature } from "../features/playerStats"

export const printPlayerStatsActions = ({
    commitStat,
}: PlayerStatsFeature, log: LogFn) => {
    commitStat.watch(v => log(`commit player stat: ${JSON.stringify(v, null, 2)}`))
}