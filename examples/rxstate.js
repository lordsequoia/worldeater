const {useRxState} = require('..')

const {commitDifference, patchState} = useRxState({})

commitDifference.watch(difference => {
    console.dir({difference})
})

patchState({foo: 'bar'})