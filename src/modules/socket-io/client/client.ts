import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../shared";

export const createClient = () => {
    const client: Socket<ServerToClientEvents, ClientToServerEvents> = io();

    return {client}
}