import { randomUUID } from 'crypto'
import http from 'http'

export class Route {
    template = null
    handler = null

    constructor(template, handler) {
        this.template = template
        this.handler = handler
    }

    validate(req) {
        const body = req.body

        if (!this.template) {
            return false
        }

        for (const key in this.template) {
            if (this.template[key] !== body[key]) {
                return false
            }
        }

        return true
    }

    async handle(json, send, req, res) {
        await this.handler(json, send, req, res)
    }
}

export class OneApi {
    id = null
    server = null
    routes = []
    defaultRoute = null

    constructor() {
        this.id = randomUUID()
        this.server = http.createServer((req, res) => {
            this.resolve(this, req, res)
        })
        console.log(`Created OneApi instance with id ${this.id}`)
    }

    add(template, handler) {
        this.routes.push(new Route(template, handler))
    }

    static async awaitBody(req) {
        return new Promise((resolve, reject) => {
            let body = ''
            req.on('data', chunk => {
                body += chunk.toString()
            })
            req.on('end', () => {
                resolve(body)
            })
        })
    }

    async resolve(api, req, res) {
        // Parse body
        try {
            req.body = JSON.parse(await OneApi.awaitBody(req))
        }
        catch (e) {
            res.end(JSON.stringify({ error: 'invalid_json' }))
            console.log("Invalid JSON received")
            return
        }

        // Check body
        if (req.body == null) {
            res.end(JSON.stringify({ error: 'empty_json' }))
            console.log("Empty JSON received")
            return
        }

        function send(json) {
            res.end(JSON.stringify(json))
        }

        for (const route of api.routes) {
            if (route.validate(req)) {
                return await route.handle(req.body, send, req, res)
            }
        }

        if (api.defaultRoute) {
            return await api.defaultRoute.handle(req.body, send, req, res)
        }

        res.end(JSON.stringify({ error: 'no_route' }))
    }
    
    listen(port) {
        this.server.listen(port)
        console.log(`Listening on port ${port}`)
    }
}

