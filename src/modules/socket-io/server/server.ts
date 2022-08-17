import { createServer } from "http";
import express from 'express'
import { Server } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData, socketsLogger as logger } from "../shared";

export const createSocketServer = (httpServer: ReturnType<typeof createHttpServer>['httpServer']) => {
    const ioServer = new Server(httpServer, { /* options */ }) as Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

    logger.debug(`io server created`)

    ioServer.on('connect', (socket) => {
        logger.info(`server received socket connection: ${socket.id}`)

        socket.on('disconnect', () => {
            logger.info('user disconnected: ' + socket.id);
        });
    })

    ioServer.listen(httpServer)

    logger.info(`io server listening`)

    return ioServer
}

export const createHttpServer = (host: string, port: number) => {
    const httpApp = express()
    const httpServer = createServer(httpApp);

    httpServer.listen(port, host, undefined, () => {
        logger.info(`http server listening on port ${port}`)
    });

    logger.info(`http server created`)

    return { httpServer, httpApp }
}

export const useSocketServer = ({ port, host }: { port?: number, host?: string }) => {
    const HOST = host || '0.0.0.0'
    const PORT = port || 3082

    const { httpServer, httpApp } = createHttpServer(HOST, PORT)
    const ioServer = createSocketServer(httpServer)

    return { httpServer, httpApp, ioServer, serverOpts: { host: HOST, port: PORT } }
}

export type SocketServerFeature = ReturnType<typeof useSocketServer>