const { useWorldEater, WorldEater } = require('..')

const config = require('./config')


const extractStreamsDemoApi = ({
    serverLogs: {
        serverLogs: {
            addServerLog,
        },
        serverEvents: {
            addServerEvent,
        },
        playerStats: {
            commitStat,
        }
    }
}) => {
    return {addServerLog, addServerEvent, commitStat}
}

const startStreamsDemo = async () => {
    const world = useWorldEater(config.projectDir, config.levelName)

    const {
        addServerLog,
        addServerEvent,
        commitStat
    } = extractStreamsDemoApi(world)

    addServerLog.watch(({timestamp, content}) => {
        app.info(`[${timestamp}] LOG --> ${content}`)
    })

    addServerEvent.watch(({timestamp, eventName, eventData}) => {
        app.info(`[${timestamp}] ${eventName} --> ${JSON.stringify(eventData, null, 2)}`)
    })

    commitStat.watch(data => {
        app.info(`[COMMIT] ${JSON.stringify(data, null, 2)}`)
    })

    world.init()
}

startStreamsDemo().then(() => console.log(`done`))