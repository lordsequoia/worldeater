import { Server } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../shared";
import express, { Request, Response } from 'express';
import { logger } from "../../../helpers";

export const createServer = (port?: number) => {
    const app = express();
    const httpServer = require('http').Server(app);

    app.get('/', (_req: Request, res: Response) => {
        res.json({ hello: 'world' })
    });

    const server = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer);

    server.listen(port || 3082);

    app.listen(port || 3082, () => {
        logger.info(`Example app listening on port ${port || 3000}!`)
    })

    return { server, app }
}