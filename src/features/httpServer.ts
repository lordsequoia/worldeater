import axios from 'axios';
import express, { Request, Response } from 'express';
import ioserver, {Socket} from 'socket.io'
import ioclient from 'socket.io-client'

export const useHttpServer = () => {
    const app = express();
    const server = require('http').Server(app);
    const port = 3000;

    const io = ioserver(server)

    app.get('/', (req: Request, res: Response) => {
        const socketclient = ioclient('http://localhost:' + port);
        socketclient.on('connect', async () => {
          for (let i = 1; i < 50; i++) {
            const getUser = fetchUsers(socketclient, i);
          }
          res.json({ data: 'just hi' });
        });
      });
}