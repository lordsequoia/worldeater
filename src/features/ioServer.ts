import { createServer } from "../modules/socket-io";
import { WorldEater } from "./worldEater";

export const useSocketServer = (app: WorldEater) => {
    const {server} = createServer()

    server.on('connection', (socket) => {
        app.info(`[IO] new client: ${socket.id}`)

        socket.emit('noArg')

        socket.on('hello', () => {
            app.info(`[IO] client says hello`)
        })

        socket.emit('noArg')
    })

    return {server}
}