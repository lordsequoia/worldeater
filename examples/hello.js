const {useWorldEater} = require('..')

async function startWorldEater() {
    const world = useWorldEater({
        rootDir: '/home/ubuntu/.beacon/mirror',
        levelName: 'world'
    })

    await world.init()

    return world
}

startWorldEater().then((world) => console.log(`world eater started: ${world.rootDir}`))