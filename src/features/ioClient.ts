import { logger } from "../helpers";
import { createClient } from "../modules/socket-io"

export const useSocketClient = () => {
    const client = createClient()

    client.on('connect', () => {
        client.emit('join', 'app logs')

        client.on("info", (message) => {
            logger.info(`[IO] received app logs info: ${message}`)
        });

    })

    client.connect()

    return {client}
}

export type SocketClientFeature = ReturnType<typeof useSocketClient>