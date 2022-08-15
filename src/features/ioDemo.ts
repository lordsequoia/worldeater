import { createServer } from "http";
import { Server } from "socket.io";
import { logger } from "../helpers";
import {io, Socket} from 'socket.io-client'
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../modules/socket-io/shared";

export const createSocketDemoServer = ({port}: {port: number}) => {
    const httpServer = createServer();

    logger.info(`http server created`)
    
    const ioServer = new Server(httpServer, { /* options */ }) as Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

    logger.info(`io server created`)

    ioServer.on("connection", (socket) => {
        logger.info(`socket connected: ${socket.id}`)
    });

    httpServer.listen(port, '0.0.0.0', undefined, () => {
        logger.info(`http server listening on port ${port}`)
    });

    ioServer.listen(httpServer)

    return {httpServer, ioServer}
}

export const createSocketDemoClient = ({port}: {port: number}) => {
    const ioClient = io(`http://localhost:${port}`) as Socket<ServerToClientEvents, ClientToServerEvents>

    logger.info(`io client created`)

    return {ioClient}
}

export const useSocketDemo = (port?: number) => {
    const PORT = port || 3082

    const {ioServer, httpServer} = createSocketDemoServer({port: PORT})
    const {ioClient} = createSocketDemoClient({port: PORT})

    ioClient.on('connect', () => {
        logger.info(`io client connected`)

        ioClient.send('hello world')

        ioClient.emit('join', 'app logs')
    })

    ioClient.connect()

    return {ioServer, ioClient, httpServer}
}