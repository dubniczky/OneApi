import { OneApi } from "./oneapi.js"

const api = new OneApi()

api.add({ type: 'ping' }, async (json, send) => {
    send({ type: 'pong' })
})

api.listen(3000)
