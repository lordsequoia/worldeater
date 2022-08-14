import { logger } from "../helpers";
import { createClient } from "../modules/socket-io"

export const useSocketClient = () => {
    const {client} = createClient()
    
    client.on("noArg", () => {
        logger.info(`[IO] received noArg from server`)
    });

    return {client}
}