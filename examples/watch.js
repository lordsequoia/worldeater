const { useWorldEater } = require("..")

const config = require('./config')

async function main (app) {
    const {info, playerStats} = app

    playerStats.$length.watch((length) => info(`players in stats: ${length}`))

    playerStats.setEntry.watch(({uuid, stats}, ) => {
        const id = uuid.split('-')[0] 

        for (const key of Object.keys(stats)) {
            app.info(`[${id}] ${Object.keys(stats[key]).length} x ${key}`)

            if (key === 'minecraft:custom') {
                for (const statName of Object.keys(stats[key])) {
                    app.info(`[${id}] (custom:${statName.replace('minecraft:', '')}) -> ${stats[key][statName]}`)
                }
            }
        }
    })

    return app
}

const loadApp = () => useWorldEater(config.rootDir, config.levelName)

main(loadApp())
    .then(({info, options: {rootDir, levelName}}) => info(`example done: ${rootDir}/${levelName}`))