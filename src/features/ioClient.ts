import { io, Socket } from "socket.io-client";
import { logger } from "../helpers";
import { ClientToServerEvents, ServerToClientEvents } from "../modules/socket-io/shared/contracts";

export const createSocketClient = (host: string, port: number) => {
    const connectionUrl = `http://${host}:${port}`

    const ioClient = io(connectionUrl) as Socket<ServerToClientEvents, ClientToServerEvents>

    ioClient.on('connect', () => {
        logger.info(`connected io client: ${connectionUrl}`)
    })

    logger.info(`connection io client: ${connectionUrl}`)

    ioClient.connect()

    return {connectionUrl, ioClient}
}

export const useSocketClient = ({port, host}: {port?: number, host?: string}) => {
    const HOST = host || '127.0.0.1'
    const PORT = port || 3082


    const {ioClient} = createSocketClient(HOST, PORT)

    return {ioClient}
}

export type SocketClientFeature = ReturnType<typeof useSocketClient>