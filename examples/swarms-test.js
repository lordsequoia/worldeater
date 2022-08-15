const { useWorldEater, WorldEater } = require('..')

const extractStreamsDemoApi = ({
    info,
    debug,
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
    return {info, debug, addServerLog, addServerEvent, commitStat}
}

const startStreamsDemo = async () => {
    const world = useWorldEater('/home/ubuntu/.swarms/default', 'world')

    const {
        info,
        debug,
        addServerLog,
        addServerEvent,
        commitStat
    } = extractStreamsDemoApi(world)
    

    addServerLog.watch(({timestamp, content}) => {
        debug(`[${timestamp}] LOG --> ${content}`)
    })

    addServerEvent.watch(({timestamp, eventName, eventData}) => {
        info(`[${timestamp}] ${eventName} --> ${JSON.stringify(eventData, null, 2)}`)
    })

    commitStat.watch(data => {
        debug(`[commit] ${JSON.stringify(data, null, 2)}`)
    })

    world.init()
}

startStreamsDemo().then(() => console.log(`done!`))