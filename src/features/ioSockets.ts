import { useSocketClient } from "./ioClient";
import { useSocketServer } from "./ioServer";
import { WorldEater } from "./worldEater";

export const useSockets = (app: WorldEater) => {
    const server = useSocketServer({port: 3082})
    const client = useSocketClient({port: 3082, host: '127.0.0.1'})

    app.info(`sockets initialized`)

    return Object.assign({}, server, client)
}

export type SocketsFeature = ReturnType<typeof useSockets>