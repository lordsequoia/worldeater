import { logger } from "../helpers";
import { createServer } from "../modules/socket-io";

export const useSocketServer = () => {
    const {app, server} = createServer()

    server.on('connection', (socket) => {
        logger.info(`[IO] new client: ${socket.id}`)

        socket.emit('noArg')

        socket.on('hello', () => {
            logger.info(`[IO] client says hello`)
        })

        socket.emit('noArg')
    })

    return {app, server}
}

export type SocketServerFeature = ReturnType<typeof useSocketServer>