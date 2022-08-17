import { createEffect, createEvent, createStore } from "effector"
import { promises, readJson } from "fs-extra"
import {parse, join} from 'path'
import { Tail } from "tail"
import chokidar, { FSWatcher } from 'chokidar'
import { splitMap } from "patronum"
import { isMatch } from "micromatch"
import { makeLogger } from "./logger"

const logger = makeLogger('files')

export const loadJsonFile = async <T>(filePath: string): Promise<T> => {
    logger.info(`loading json file: ${filePath}`)

    const fileData = await readJson(filePath)

    return Object.assign({}, fileData) as T
}

export const loadJsonArrayFile = async <T>(filePath: string): Promise<T[]> => {
    logger.info(`loading json array file: ${filePath}`)

    const fileData = await readJson(filePath)

    if (fileData === undefined) {
        return [] as T[]
    }

    return fileData as T[]
}

export const listFiles = async (fileDir: string) => {
    const files = await promises.readdir(fileDir)
    
    const allFiles = files.map(v => Object.assign({fullPath: join(fileDir, v)}, parse(v)))
    
    return {fileDir, files, allFiles}
}

export const listJsonFiles = async (fileDir: string) => {
    const fileList = await listFiles(fileDir)

    const jsonFiles = fileList.allFiles.filter(v => v.ext === '.json')

    return Object.assign(fileList, {jsonFiles})
}

export type JsonDir<T> = {[key: string]: T}

export const loadJsonDir = async<T>(fileDir: string, keyBy?: (v: T) => string): Promise<JsonDir<T>> => {
    logger.info(`loading json dir: ${fileDir}`)

    const {jsonFiles} = await listJsonFiles(fileDir)

    const results = {} as JsonDir<T>

    for await (const {name, fullPath} of jsonFiles) {
        const fileData = await loadJsonFile<T>(fullPath)
        const fileKey = typeof keyBy === 'undefined' ? name : keyBy(fileData)

        results[fileKey] = fileData 
    }

    return results
}

export const watchFile = (filePath: string) => {
    logger.info(`watching file: ${filePath}`)

    const addLine = createEvent<string>()

    const $lines = createStore<string[]>([] as string[])
        .on(addLine, (state, line) => [...state, line])

    const tail = new Tail(filePath)
    tail.on('line', line => addLine(line))

    const stopWatching = createEffect(() => {
        tail.unwatch()
    })

    return {$lines, addLine, stopWatching }
}

export type FileWatcherEventName = 
    | 'add'
    | 'addDir'
    | 'change'
    | 'unlink'
    | 'unlinkDir'

export type FileWatcherEvent = {
    eventName: FileWatcherEventName,
    path: string,
    fullPath: string
}

export const watchDir = (rootDir: string, exclude?: string | string[]) => {
    const excluded = exclude || [
        'libraries/*',
    ]

    logger.info(`watching dir: ${rootDir}, exclude: ${JSON.stringify(excluded, null, 2)}`)

    const fileEvent = createEvent<FileWatcherEvent>()

    const matchFileEvent = (pattern: string | string[]) => fileEvent.filter({
        fn: v => isMatch(v.path, pattern)
    })

    const {fileAdded, fileChanged, fileRemoved, directoryAdded, directoryRemoved} = splitMap({
        source: fileEvent,
        cases: {
            fileAdded: ({eventName, path, fullPath}) => eventName !== 'add' ? undefined : {path, fullPath},
            fileChanged: ({eventName, path, fullPath}) => eventName !== 'change' ? undefined : {path, fullPath},
            fileRemoved: ({eventName, path, fullPath}) => eventName !== 'unlink' ? undefined : {path, fullPath},

            directoryAdded: ({eventName, path, fullPath}) => eventName !== 'addDir' ? undefined : {path, fullPath},
            directoryRemoved: ({eventName, path, fullPath}) => eventName !== 'unlinkDir' ? undefined : {path, fullPath},
        }
    })

    const $files = createStore<string[]>([] as string[])
        .on(fileAdded, (files, file) => [...files, file.path])
        .on(fileRemoved, (files, file) => files.filter(x => x !== file.path))

    let watcher: FSWatcher | null = null
    let stopWatching: null | (() => void) = null

    const startWatching = () => {
        logger.info(`starting watcher: ${rootDir}`)

        if (stopWatching !== null) {
            stopWatching()
        }

        watcher = chokidar.watch('.', {cwd: rootDir})
        
        watcher.on('all', (eventName, path) => {
            if (isMatch(path, excluded)) return

            fileEvent({eventName, path, fullPath: join(rootDir, path)})
        })

        fileEvent.watch(v => logger.info(`[file-watcher] ${v.eventName}: ${v.path}`))

        stopWatching = () => {
            logger.info(`stopping watcher: ${rootDir}`)

            watcher?.close()
            watcher = null
            stopWatching = null
        }
    }

    const when = ({eventNames, patterns}: {eventNames?: FileWatcherEventName | FileWatcherEventName[] | '*', patterns?: string | string[] | '*'}) => {
        const filterByEventNames = ({eventName}: FileWatcherEvent) => {
            if (eventNames === '*' || typeof eventNames === 'undefined') return true

            if (typeof eventName === 'string') {
                return eventName === eventNames
            }

            return eventNames.includes(eventName)
        }

        const filterByPatterns = ({path}: FileWatcherEvent) => {
            if (patterns === '*' || typeof patterns === 'undefined') return true

            return isMatch(path, patterns)
        }

        return fileEvent
            .filter({fn: filterByPatterns})
            .filter({fn: filterByEventNames})
    }

    return {$files, fileEvent, matchFileEvent, fileAdded, fileChanged, fileRemoved, directoryAdded, directoryRemoved, startWatching, stopWatching, when}
}