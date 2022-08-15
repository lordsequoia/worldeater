import { useSocketClient, useSocketServer } from "../modules/socket-io";

export type SocketOpts = {
    port: number,
    host: string
}

export const useSockets = (options?: Partial<SocketOpts>) => {

    const makeOpts = (opts?: Partial<SocketOpts>) => 
        Object.assign({}, options || {}, opts || {})

    const createServer = (opts?: Partial<SocketOpts>) => 
        useSocketServer(makeOpts(opts))

    const createClient = (opts?: Partial<SocketOpts>) => 
        useSocketClient(makeOpts(opts))

    return {
        createClient,
        createServer,
    }
}

export type SocketsFeature = ReturnType<typeof useSockets>