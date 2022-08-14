const {trackState} = require('..')

const {commitDifference, patchState} = trackState({})

commitDifference.watch(difference => {
    console.dir({difference})
})

patchState({foo: 'bar'})