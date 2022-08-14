import { createEffect, createEvent, createStore } from "effector"
import { promises, readJson } from "fs-extra"
import {parse, join} from 'path'
import { Tail } from "tail"
import chokidar, { FSWatcher } from 'chokidar'
import { splitMap } from "patronum"
import { isMatch } from "micromatch"

export const loadJsonFile = async <T>(filePath: string): Promise<T> => {
    const fileData = await readJson(filePath)

    return Object.assign({}, fileData) as T
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

export const watchDir = (rootDir: string) => {
    const fileEvent = createEvent<{eventName: FileWatcherEventName, path: string, fullPath: string}>()

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
        if (stopWatching !== null) {
            stopWatching()
        }

        watcher = chokidar.watch('.', {cwd: rootDir})
        
        watcher.on('all', (eventName, path) => {
            fileEvent({eventName, path, fullPath: join(rootDir, path)})
        })

        stopWatching = () => {
            watcher?.close()
            watcher = null
            stopWatching = null
        }
    }

    return {$files, fileEvent, matchFileEvent, fileAdded, fileChanged, fileRemoved, directoryAdded, directoryRemoved, startWatching, stopWatching}
}