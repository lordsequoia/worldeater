const { createStore } = require('effector')
const { useDiff, useWorldEater, logger } = require('..')
const config = require('./config')

const startDemo = async (app) => {
    const foo = createStore({name: 'abc', age: 781})

    const diff = useDiff(foo)

    diff.$states.watch(({state, oldState, differences}) => {
        console.dir({state, oldState})

        for (const d of differences) {
            console.dir(d)
        }
    })
}

const loadApp = () => useWorldEater(config.rootDir, config.levelName)

startDemo(loadApp())
    .then(() => logger.info(`repl done: ${config.rootDir}/${config.levelName}`))