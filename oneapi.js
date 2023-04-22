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
        return await this.handler(json, send, req, res)
    }
}

class FakeConsole {
    log(...args) { }
    error(...args) { }
}

export class OneApi {
    static DefaultPort = 80

    id = null
    server = null
    routes = []
    middleware = []
    defaultRoute = null
    logger = console

    constructor(debug = false) {
        if (!debug) {
            this.logger = new FakeConsole()
        }

        this.id = randomUUID()
        this.server = http.createServer((req, res) => {
            this.resolve(this, req, res)
        })
        this.logger.log(`Created OneApi instance with id ${this.id}`)
    }

    use(middleware) {
        if (middleware == null) {
            throw new Error('Cannot add null middleware')
        }

        if (!(middleware instanceof Function)) {
            throw new Error('Middleware must be a function')
        }

        this.middleware.push(middleware)
    }

    add(template, handler) {
        if (template == null || handler == null) {
            throw new Error('Cannot add null route')
        }

        if (Object.keys(template).length === 0) {
            throw new Error('Route template cannot be empty object. Use default route instead.')
        }

        if (!(handler instanceof Function)) {
            throw new Error('Route handler must be a function')
        }

        this.routes.push(new Route(template, handler))
    }

    default(handler) {
        if (handler == null) {
            throw new Error('Cannot add null route')
        }
        this.defaultRoute = new Route(null, handler)
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
        res.setHeader('Content-Type', 'application/json')

        // Parse body
        try {
            req.body = JSON.parse(await OneApi.awaitBody(req))
        }
        catch (e) {
            res.json(JSON.stringify({ error: 'invalid_json' }))
            this.logger.log("Invalid JSON received")
            return
        }

        // Check body
        if (req.body == null) {
            res.end(JSON.stringify({ error: 'empty_json' }))
            this.logger.log("Empty JSON received")
            return
        }

        function send(json) {
            res.end(JSON.stringify(json))
        }

        // Apply middleware
        for (const middleware of api.middleware) {
            const resp = await middleware(req.body, req, res)
            this.logger.log(req.body)
            if (resp) {
                send(resp)
                return
            }
        }

        for (const route of api.routes) {
            if (route.validate(req)) {
                const resp = await route.handle(req.body, send, req, res)
                if (resp) {
                    send(resp)
                }
                return
            }
        }

        if (api.defaultRoute) {
            const resp = await api.defaultRoute.handle(req.body, send, req, res)
            if (resp) {
                send(resp)
            }
            return
        }

        res.end(JSON.stringify({ error: 'no_route' }))
    }
    
    listen(...args) {
        if (args.length === 0) {
            args.push(OneApi.DefaultPort)
        }
        this.server.listen(...args)
        this.logger.log(`Listening on port ${args[0]}`)
        return this.server
    }
}
