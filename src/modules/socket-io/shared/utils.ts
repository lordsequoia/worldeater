import { makeLogger } from "../../../helpers"

export const useFoo = () => {
    const bar = 'dummy'

    return {bar}
}

export const socketsLogger = makeLogger('sockets')