import { Server } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../shared";

export const createServer = () => {
    const server = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>();

    return {server}
}