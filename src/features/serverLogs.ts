import { createStore, Store, Event } from "effector";
import { WorldEater } from "./worldEater";
import { watchFile } from "../helpers";

export const SERVER_LOG_REGEX = /\[(.*)\] \[(.*)\/(.*)\]: (.*)/m

export type ServerLog = {
    raw: string
    timestamp: string
    thread: string
    level: string
    content: string
}

export const SERVER_EVENTS = {
    serverStarting: { regex: /Starting minecraft server version (.*)/, groups: ['version'] },
    serverStarted: { regex: /Time elapsed: (\d*) ms/m, groups: ['startupTime'] },
    serverStopping: { regex: /Stopping the server/m, groups: [] },
    serverStopped: { regex: /Stopped the server/m, groups: [] },
    preparingSpawn: { regex: /Preparing spawn area: (\d*)%/, groups: ['progress'] },
    playerJoined: { regex: /(.*) joined the game/m, groups: ['playerName'] },
    playerLeft: { regex: /(.*) left the game/m, groups: ['playerName'] },
    chatMessage: { regex: /<(.*)> (.*)/m, groups: ['playerName', 'messageContent'] },
}

export type ServerEventTypes = typeof SERVER_EVENTS

export type ServerEventName = keyof ServerEventTypes

export type ServerEvent = {
    timestamp: string
    eventName: ServerEventName
    eventData: string[]
}

export const createServerLog = (raw: string, [message, timestamp, thread, level, content]: RegExpExecArray) => {
    return {raw, message, timestamp, thread, level, content} as ServerLog
}

export const parseServerLog = (raw: string) => {
    const result = SERVER_LOG_REGEX.exec(raw)

    if (result === undefined || !result || !result.length) {
        return
    }
    
    return createServerLog(raw, result)
}

export const mapServerLogs = (store: Store<string[]>) => store.map(input => input.map(parseServerLog).filter(v => v !== undefined))

export const parseServerEvent = ({content, timestamp}: ServerLog) => {
    for (const eventName of Object.keys(SERVER_EVENTS)) {
        const {regex: pattern} = SERVER_EVENTS[eventName as ServerEventName]
        const result = pattern.exec(content)

        if (result !== undefined && result !== null) {
            const eventData = result.splice(1)

            return {
                timestamp,
                eventName,
                eventData,
            } as ServerEvent
        }
    }

    return undefined
}

export const createServerLogs = (addLine: Event<string>) => {
    const addServerLog = addLine.filterMap((line) => parseServerLog(line))
    
    const $serverLogs = createStore<ServerLog[]>([] as ServerLog[])
        .on(addServerLog, (state, payload) => [...state, payload])

    return {$serverLogs, addServerLog}
}

export const createServerEvents = (addServerLog: Event<ServerLog>) => {
    const addServerEvent = addServerLog.filterMap((serverLog) => parseServerEvent(serverLog))

    const $serverEvents = createStore<ServerEvent[]>([] as ServerEvent[])
        .on(addServerEvent, (state, payload) => [...state, payload])

    return {$serverEvents, addServerEvent}
}

export const useServerLogs = ({ filePath }: WorldEater) => {
    const logsFile = filePath(['logs', 'latest.log'])

    const rawLogs = watchFile(logsFile)
    const serverLogs = createServerLogs(rawLogs.addLine)
    const serverEvents = createServerEvents(serverLogs.addServerLog)


    return {rawLogs, serverLogs, serverEvents}
}