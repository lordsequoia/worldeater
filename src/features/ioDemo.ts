import { useSocketServer } from "./ioServer";
import { useSocketClient } from "./ioClient";
import { logger } from "../helpers";

export const useSocketDemo = (port?: number) => {
    const PORT = port || 3082

    const {ioServer, httpServer} = useSocketServer({port: PORT})
    const {ioClient} = useSocketClient({port: PORT})

    ioClient.on('info', (message) => {
        logger.info(`received message ${message}`)
    })


    setInterval(() => {
        ioServer.emit('info', new Date())
    }, 5000)

    return {ioServer, ioClient, httpServer}
}