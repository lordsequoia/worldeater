import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../shared";

export const createClient = () => {
    const client: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:3082');

    return client
}