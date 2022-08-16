import { createEffect, createEvent, forward } from 'effector';
import {join, parse} from 'path'
import {loadJsonDir, loadJsonFile, logger, trackState} from '../helpers'
import { WorldEater } from './worldEater';

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

export type PlayerStatsIndex = {[key: string]: PlayerStatsFile}

export const usePlayerStats = (app: {storage: WorldEater['storage'], options: WorldEater['options']}, initialState?: PlayerStatsIndex) => {
    const {$state: $stats, commitDifference, patchState, updateState} = trackState(initialState || ({} as PlayerStatsIndex))

    const loadStatsFx = createEffect(async (filePath: string) => {
        const uuid = parse(filePath).name

        logger.info(`loading stats for ${uuid}`)

        const data = await loadJsonFile<PlayerStatsFile>(filePath)

      const patch = {} as PlayerStatsIndex
      patch[uuid] = data
      
      return patch
    })

    const loadAllStatsFx = createEffect(async (fromDir?: string) => {
        const result = await loadJsonDir<PlayerStatsFile>(fromDir || join(app.options.rootDir, app.options.levelName, 'stats'))

        return result as PlayerStatsIndex
    })

    const loadStatsById = createEvent<string>()
    const loadStatsByFile = loadStatsById.map(v => join(app.options.rootDir, app.options.levelName, 'stats', v + ".json"))
    const loadStatsByDir = createEvent<string | undefined>()
    const loadStats = createEvent<undefined>()
    
    forward({from: loadStatsFx.doneData, to: patchState})
    forward({from: loadAllStatsFx.doneData, to: updateState})
    forward({from: loadStatsByFile, to: loadStatsFx})
    forward({from: loadStatsByDir, to: loadAllStatsFx})
    forward({from: loadStats, to: loadStatsByDir})

    const statsFileEvent = app.storage.matchFileEvent('**/stats/*.json')

    statsFileEvent.watch(({eventName, path}) => logger.info(`stats file ${eventName}: ${parse(path).name}`))

    forward({
        from: statsFileEvent.map(({fullPath}) => fullPath),
        to: loadStatsFx
    })

    const feature = {
        $stats,
        loadStats,
        loadStatsById,
        loadStatsByFile,
        loadStatsByDir,
        loadStatsFx,
        loadAllStatsFx,
        commitStat: commitDifference,
        patchStats: patchState,
        updateStats: updateState,
    }

    return feature
}

export type PlayerStatsFeature = ReturnType<typeof usePlayerStats>