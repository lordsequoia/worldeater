import { createEffect, createEvent, createStore, forward } from "effector";
import { Socket } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData, socketsLogger as logger } from "../modules/socket-io";
import { WorldEater } from "./worldEater";

export type SocketEntry = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const createSocketsIndex = () => {
    const connected = createEvent<SocketEntry>()
    const disconnected = createEvent<SocketEntry>()

    connected.watch(socket => {
        socket.on('disconnect', () => disconnected(socket))
    })

    const $sockets = createStore<SocketEntry[]>([])
        .on(connected, (state, socket) => [...state, socket])
        .on(disconnected, (state, socket) => state.filter(v => v.id !== socket.id))
    
    const $connections = $sockets.map(sockets => sockets.length)

    return {$sockets, $connections, connected, disconnected}
}

export type SocketEvent<T=unknown> = {
    socket: SocketEntry
} & T

export type RoomEvent = SocketEvent<{room: string}>
export type RoomActionEvent = SocketEvent<{room: string, action: 'userJoined' | 'userLeft'}>

export type HelloEvent = SocketEvent<{who: string}>
export type ChatEvent = SocketEvent<{room: string, message: string}>
export type RconEvent = SocketEvent<{command: string}>

export const createSocketsManager = (ioServer: WorldEater['ioServer']) => {
    const sockets = createSocketsIndex()

    const helloSent = createEvent<HelloEvent>()
    const joinSent = createEvent<RoomEvent>()
    const leaveSent = createEvent<RoomEvent>()
    const chatSent = createEvent<ChatEvent>()
    const rconSent = createEvent<RconEvent>()

    const userJoined = createEvent<RoomEvent>()
    const userLeft = createEvent<RoomEvent>()


    const joinRoomFx = createEffect(async ({socket, room}: {socket: SocketEntry, room: string}) => {
        await socket.join(room)

        return {socket, room, action: 'userJoined'} as RoomActionEvent
    })

    const leaveRoomFx = createEffect(async ({socket, room}: {socket: SocketEntry, room: string}) => {
        await socket.leave(room)

        return {socket, room, action: 'userLeft'} as RoomActionEvent
    })

    const loadSocketFx = createEffect((socket: SocketEntry) => {
        const hello = socket.on('hello', (who: string) => helloSent({socket, who}))
        const join = socket.on('join', (room: string) => joinSent({socket, room}))
        const leave = socket.on('leave', (room: string) => leaveSent({socket, room}))
        const chat = socket.on('chat', (room: string, message: string) => chatSent({socket, room, message}))
        const rcon = socket.on('rcon', (command: string) => rconSent({socket, command}))

        return {socket, hello, join, leave, chat, rcon}
    })

    const announceFx = createEffect(({socket, room, action}: RoomActionEvent) => {
        const sent = ioServer.to(room).emit(action, socket.id, room)

        return sent
    })

    const sendChatFx = createEffect((message: string) => {
        return {message}
    })

    const sendCommandFx = createEffect((command: string) => {
        return {command}
    })

    forward({from: sockets.connected, to: loadSocketFx})

    forward({from: joinSent, to: joinRoomFx})
    forward({from: joinRoomFx.doneData, to: userJoined})
    forward({from: joinRoomFx.doneData, to: announceFx})

    forward({from: leaveSent, to: leaveRoomFx})
    forward({from: leaveRoomFx.doneData, to: userLeft})
    forward({from: leaveRoomFx.doneData, to: announceFx})

    ioServer.on('connection', s => sockets.connected(s))

    return Object.assign(sockets, {
        helloSent,
        joinSent,
        leaveSent,
        userJoined,
        userLeft,
        chatSent,
        rconSent,
        loadSocketFx,
        joinRoomFx,
        leaveRoomFx,
        announceFx,
        sendChatFx,
        sendCommandFx,
    })
}

export const useSocketsManager = (ioServer: WorldEater['ioServer']) => {
    const manager = createSocketsManager(ioServer)

    manager.connected.watch(socket => logger.info(`[m] socket connected: ${socket.id}`))

    manager.disconnected.watch(socket => logger.info(`[m] socket disconnected: ${socket.id}`))

    manager.$connections.watch(connections => logger.info(`connected sockets: ${connections}`))


    return manager
}

export type SocketsManager = ReturnType<typeof useSocketsManager>