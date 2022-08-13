const { useWorldEater } = require('..')

const config = require('./config')

const loadApp = () => useWorldEater(config.rootDir, config.levelName)

const startStreamsDemo = () => {
    const app = loadApp()

    app.serverLogs.addServerLog.watch(({timestamp, content}) => {
        app.info(`[${timestamp}] ${content}`)
    })
}

startStreamsDemo()