import { useSocketClient } from "./ioClient";
import { useSocketServer } from "./ioServer";
import { WorldEater } from "./worldEater";

export const useSockets = (app: WorldEater) => {
    const {server} = useSocketServer(app)
    const {client} = useSocketClient()

    return {server, client}
}

export type SocketsFeature = ReturnType<typeof useSockets>