const { useWorldEater, WorldEater } = require('..')

const extractStreamsDemoApi = ({
    info,
    serverLogs: {
        serverLogs: {
            addServerLog,
        },
        serverEvents: {
            addServerEvent,
        },
    },
    playerStats: {
        commitStat,
    }
}) => {
    return {info, addServerLog, addServerEvent, commitStat}
}

const startStreamsDemo = async () => {
    const world = useWorldEater('/home/ubuntu/.beacon/mirror', 'world')

    const {
        info,
        addServerLog,
        addServerEvent,
        commitStat
    } = extractStreamsDemoApi(world)

    addServerLog.watch(({timestamp, content}) => {
        info(`[${timestamp}] LOG --> ${content}`)
    })

    addServerEvent.watch(({timestamp, eventName, eventData}) => {
        info(`[${timestamp}] ${eventName} --> ${JSON.stringify(eventData, null, 2)}`)
    })

    commitStat.watch(data => {
        info(`[COMMIT] ${JSON.stringify(data, null, 2)}`)
    })

    world.init()
}

startStreamsDemo().then(() => console.log(`done`))