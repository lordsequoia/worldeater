#!/usr/bin/env node
Object.assign(process.env, require('../env.json'))

console.dir(process.env)

const {launch} = require('..')

launch(require('./config'))