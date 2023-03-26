import { randomUUID } from 'crypto'
import http from 'http'

export class OneApi {
    id = null
    server = null

    constructor() {
        this.id = randomUUID()
        this.server = http.createServer(this.onRequest)
    }

    async onRequest(req, res) {
        res.end('hi')
    }
    
    listen(port) {
        this.server.listen(port)
    }
}

