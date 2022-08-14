const { useWorldEater } = require('..')

const config = require('./config')

const startStreamsDemo = async () => {
    const world = useWorldEater(config.projectDir, config.levelName)

    world.serverLogs.serverLogs.addServerLog.watch(({timestamp, content}) => {
        app.info(`[${timestamp}] ${content}`)
    })

    world.playerStats.commit.watch(data => {
        app.info(`[COMMIT] ${JSON.stringify(data, null, 2)}`)
    })

    world.init()
}

startStreamsDemo().then(() => console.log(`done`))