const {useWorldEater, logger} = require('..')

async function startWorldEater() {
    const world = useWorldEater({
        rootDir: '/home/ubuntu/.beacon/mirror',
        levelName: 'world'
    })

    await world.init()

    /* world.playerStats.watch((v) => {
        logger.info(v)
    }) */

    return world
}

startWorldEater().then((world) => console.log(`world eater started: ${world.rootDir}`))