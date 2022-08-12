import { createApi, createEffect, createStore, Store, forward, createEvent } from 'effector';
import {join} from 'path'
import {JsonDir, loadJsonDir} from '../helpers'

export type PlayerStatsGroup = 
    | 'used'
    | 'mined'
    | 'broken'
    | 'custom'
    | 'killed'
    | 'crafted'
    | 'dropped'
    | 'killed_by'
    | 'picked_up'

export type PlayerStats = {
    [key in PlayerStatsGroup]: { [key: string]: number; };
};

export type PlayerStatsFile = {
    DataVersion: number
    stats: Partial<PlayerStats>
}

export type PlayerStatsEntry = PlayerStatsFile & {uuid: string}
export type PlayerStatsEntries = {[key: string]: PlayerStatsEntry}

export type PlayerStatsStore = Store<PlayerStatsEntries>

export const createPlayerStatsStore = () => {
    const $playerStats = createStore<PlayerStatsEntries>({} as PlayerStatsEntries)

    const {setPlayerStats, resetPlayerStats} = createApi($playerStats, {
        resetPlayerStats: () => ({} as PlayerStatsEntries),
        setPlayerStats: (state, entry: PlayerStatsEntry) => {
            const obj = {} as PlayerStatsEntries
            
            obj[entry.uuid] = entry

            return Object.assign(state, obj)
        }
    })

    return {$playerStats, setPlayerStats, resetPlayerStats}
}

export const usePlayerStats = ({rootDir, levelName}: {rootDir: string, levelName: string}) => {
    const {$playerStats, setPlayerStats, resetPlayerStats} = createPlayerStatsStore()

    const loadAllStatsFx = createEffect(async (statsDir?: string) => {
        const result = await loadJsonDir<PlayerStatsFile>(statsDir || join(rootDir, levelName, 'stats'))

        return result
    })

    const updateAllStatsFx = createEffect(async (allStats: JsonDir<PlayerStatsFile>) => {
        for (const uuid of Object.keys(allStats)) {
            const playerStatsEntry = Object.assign(allStats[uuid], {uuid})

            setPlayerStats(playerStatsEntry)
        }

        return allStats
    })

    const loadStatsDir = createEvent<string>()
    forward({from: loadStatsDir, to: loadAllStatsFx})
    forward({from: loadAllStatsFx.doneData, to: updateAllStatsFx})

    const synchronizeStats = createEvent()
    synchronizeStats.watch(() => loadStatsDir(join(rootDir, levelName, 'stats')))


    return {$playerStats, setPlayerStats, loadAllStatsFx, updateAllStatsFx, resetPlayerStats, loadStatsDir, synchronizeStats}
}

export type PlayerStatsFeature = ReturnType<typeof usePlayerStats>