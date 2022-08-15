import { logger } from "../helpers";
import { useSockets } from "./ioSockets";

export const useSocketDemo = (port?: number, host?: string) => {
    const {createServer, createClient} = useSockets({port, host})

    const startServer = () => {
        const {ioServer} = createServer({host: '0.0.0.0'})
        
        setInterval(() => {
            ioServer.emit('info', new Date())
        }, 5000)

        return ioServer
    }

    const startClient = () => {
        const {ioClient} = createClient()

        ioClient.on('info', (message) => {
            logger.info(`received message ${message}`)
        })

        return ioClient
    }

    return {startClient, startServer}
}