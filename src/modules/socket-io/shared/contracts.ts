export interface ServerToClientEvents {
    info: (message: any) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    userJoined: (user: string, room: string) => void;
    userLeft: (user: string, room: string) => void;
    chatMessage: (topic: string, user: string, message: string) => void;
}

export interface ClientToServerEvents {
    hello: (who: string) => void;
    join: (room: string) => void;
    leave: (room: string) => void;
    chat: (room: string, message: string) => void,
    rcon: (command: string) => void;
}

export interface InterServerEvents {
    ping: () => void;
    pong: () => void;
}

export interface SocketData {
    name: string;
    age: number;
}