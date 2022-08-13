import { createApi, createEffect, createStore, Store, forward, createEvent } from 'effector';
import {join} from 'path'
import {loadJsonDir} from '../helpers'
import { WorldEater } from './worldEater';
import { Difference } from '../helpers/diff';

export type PlayerStatsGroup = 
    | 'minecraft:used'
    | 'minecraft:mined'
    | 'minecraft:broken'
    | 'minecraft:custom'
    | 'minecraft:killed'
    | 'minecraft:crafted'
    | 'minecraft:dropped'
    | 'minecraft:killed_by'
    | 'minecraft:picked_up'

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
    const $entries = createStore<PlayerStatsEntries>({} as PlayerStatsEntries)
    const $changes = createStore<Difference[]>([] as Difference[])
    const $length = $entries.map(v => Object.keys(v).length)

    const {patch, reset} = createApi($entries, {
        reset: () => ({} as PlayerStatsEntries),
        patch: (state, patch: PlayerStatsEntries) => Object.assign(state, patch)
    })

    return {$entries, $changes, $length, patch, reset}
}

export const usePlayerStats = ({options: {rootDir, levelName}}: WorldEater) => {
    const {$entries, $changes, $length, patch, reset} = createPlayerStatsStore()

    const loadAllStatsFx = createEffect(async (statsDir?: string) => {
        const result = await loadJsonDir<PlayerStatsFile>(statsDir || join(rootDir, levelName, 'stats'))

        return result
    })

    const loadStatsDir = createEvent<string>()
    forward({from: loadStatsDir, to: loadAllStatsFx})
    forward({from: loadAllStatsFx.doneData.map(v => v as PlayerStatsEntries), to: patch})

    const synchronizeStats = createEvent()
    synchronizeStats.watch(() => loadStatsDir(join(rootDir, levelName, 'stats')))

    const feature = {
        $entries,
        $length,
        $changes,
        patch,
        reset,
        loadAllStatsFx,
        loadStatsDir,
        synchronizeStats,
    }

    return feature
}

export type PlayerStatsFeature = ReturnType<typeof usePlayerStats>