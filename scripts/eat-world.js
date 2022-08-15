const {useWorldEater, useSockets, makeLogger} = require('..')

const logger = makeLogger('eat-world-script')

const eatWorld = () => {
    const world = useWorldEater('/home/ubuntu/.swarms/default', 'world', '0.0.0.0', 3083)

    const {createClient} = useSockets({
        host: '127.0.0.1',
        port: 3083
    })

    const {ioClient} = createClient()
    
    ioClient.on('info', (message) => {
        logger.info(`eat -> ${message}`)
    })

    world.init()
}

eatWorld()

