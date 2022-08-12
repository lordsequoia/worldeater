const {useStore} = require('..')

const store = useStore({})

store.value['foo'] = 'bar'

store.value['bar'] = 'foo'

store.value['dummy'] = {
    foo: 'bar'
}

store.value.dummy.foo = 'barz'