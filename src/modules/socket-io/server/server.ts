import { createServer } from "http";
import { Server } from "socket.io";
import { logger } from "../../../helpers";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../shared";

export const createSocketServer = (httpServer: ReturnType<typeof createHttpServer>) => {
    const ioServer = new Server(httpServer, { /* options */ }) as Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

    logger.info(`io server created`)

    ioServer.on('connect', (socket) => {
        logger.info(`server received socket connection: ${socket.id}`)
    })

    ioServer.on("connection", (socket) => {
        logger.info(`a client socket connected: ${socket.id}`)

        socket.on('join', (room) => {
            logger.info(`a client requests to join ${room}`)
            socket.join(room)
            socket.emit('joined', room)
        })
    });

    ioServer.listen(httpServer)

    logger.info(`io server listening`)

    return ioServer
}

export const createHttpServer = (host: string, port: number) => {
    const httpServer = createServer();

    httpServer.listen(port, host, undefined, () => {
        logger.info(`http server listening on port ${port}`)
    });

    logger.info(`http server created`)

    return httpServer
}

export const useSocketServer = ({port, host}: {port?: number, host?: string}) => {
    const HOST = host || '0.0.0.0'
    const PORT = port || 3082

    const httpServer = createHttpServer(HOST, PORT)
    const ioServer = createSocketServer(httpServer)

    return {httpServer, ioServer, serverOpts: {host: HOST, port: PORT}}
}

export type SocketServerFeature = ReturnType<typeof useSocketServer>