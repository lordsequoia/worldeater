import { createEffect, createEvent, createStore } from "effector";
import { Socket } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData, socketsLogger as logger } from "../modules/socket-io";
import { WorldEater } from "./worldEater";

export type SocketEntry = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const useSocketManager = (app: WorldEater) => {
    const addSocket = createEvent<SocketEntry>()
    const removeSocket = createEvent<SocketEntry>()

    app.ioServer.on('connection', socket => addSocket(socket))

    addSocket.watch(socket => {
        socket.on('disconnect', () => {
            removeSocket(socket)
        })
    })

    addSocket.watch(socket => logger.info(`[m] socket connected: ${socket.id}`))
    removeSocket.watch(socket => logger.info(`[m] socket disconnected: ${socket.id}`))

    const $sockets = createStore<SocketEntry[]>([])
        .on(addSocket, (state, socket) => [...state, socket])
        .on(removeSocket, (state, socket) => state.filter(v => v.id !== socket.id))
    
    const $count = $sockets.map(sockets => sockets.length)

    $count.watch(count => logger.info(`[m] connections: ${count}`))

    const helloSent = createEvent<{socket: SocketEntry}>()
    const joinSent = createEvent<{socket: SocketEntry, room: string}>()

    addSocket.watch(socket => {
        socket.on('hello', () => helloSent({socket}))
        socket.on('join', (room: string) => joinSent({socket, room}))
    })

    const announceJoinFx = createEffect(() => {
        /* app.ioServer.emit('userJoined', {
            
        }) */
    })

    return {
        $sockets,
        $count,
        addSocket,
        removeSocket,
        announceJoinFx,
    }
}