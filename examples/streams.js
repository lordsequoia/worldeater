const { useWorldEater } = require('..')

const config = require('./config')

const startStreamsDemo = async () => {
    const world = useWorldEater(config.projectDir, config.levelName)

    world.serverLogs.addServerLog.watch(({timestamp, content}) => {
        app.info(`[${timestamp}] ${content}`)
    })

    await world.init()
}

startStreamsDemo().then(() => console.log(`done`))