export interface ServerToClientEvents {
    info: (message: any) => void;
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    joined: (room: string) => void;
}

export interface ClientToServerEvents {
    hello: () => void;
    join: (room: string) => void;
}

export interface InterServerEvents {
    ping: () => void;
    pong: () => void;
}

export interface SocketData {
    name: string;
    age: number;
}