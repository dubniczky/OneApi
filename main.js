import { OneApi } from "./oneapi.js"

const api = new OneApi()

api.use(async (json) => {
    json['middleware'] = true
    return null
})

api.add({ type: 'ping' }, async (json) => {
    return { type: 'pong' }
})

api.add({ type: 'echo' }, async (json) => {
    return json
})

api.default(async (json) => {
    return { test: 'nopath'}
})

api.listen(3000)
