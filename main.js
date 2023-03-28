import { OneApi } from "./oneapi.js"

const api = new OneApi()

api.add({ type: 'ping' }, async (json) => {
    return { type: 'pong' }
})

api.default(async (json) => {
    return { test: 'nopath'}
})

api.listen(3000)
