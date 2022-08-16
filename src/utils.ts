import { v4 as uuidv4 } from 'uuid';

export const makeUuid = () => {
    const uuid = uuidv4()

    return uuid
}