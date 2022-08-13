import { createEffect, createEvent, createStore } from "effector"
import { promises, readJson } from "fs-extra"
import {parse, join} from 'path'
import { Tail } from "tail"

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