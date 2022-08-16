import { createStore, Store, Event, createEvent } from "effector";
import { logger, watchFile } from "../helpers";
import { WorldEater } from "./worldEater";

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

export const createRawLogs = ({storage}: {storage: WorldEater['storage']}) => {
    const addLine = createEvent<string>()

    const logsFileDetected = storage.matchFileEvent('logs/latest.log').filter({fn: v => {
        return v.eventName === 'add'
    }})

    logsFileDetected.watch(logsFile => {
        logger.info(`logs file detected: ${logsFile.path}`)
        
        watchFile(logsFile.fullPath).addLine.watch(line => {
            addLine(line)
        })
    })

    return {addLine, logsFileDetected}
}

export const useServerLogs = ({storage}: {storage: WorldEater['storage']}) => {
    const rawLogs = createRawLogs({storage})
    const serverLogs = createServerLogs(rawLogs.addLine)
    const serverEvents = createServerEvents(serverLogs.addServerLog)


    return {rawLogs, serverLogs, serverEvents}
}

export type UseServerLogs = typeof useServerLogs
export type ServerLogsFeature = ReturnType<UseServerLogs>