const {useWorldEater, logger} = require('..')

const eatWorld = () => {
    const world = useWorldEater('/home/ubuntu/.swarms/default', 'world')

    world.sockets.ioClient.on('info', (message) => {
        logger.info(`eat -> ${message}`)
    })
}

eatWorld()

