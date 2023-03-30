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

export class OneApi {
    static DefaultPort = 80

    id = null
    server = null
    routes = []
    middleware = []
    defaultRoute = null

    constructor() {
        this.id = randomUUID()
        this.server = http.createServer((req, res) => {
            this.resolve(this, req, res)
        })
        console.log(`Created OneApi instance with id ${this.id}`)
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

        // Apply middleware
        for (const middleware of api.middleware) {
            const resp = await middleware(req.body, req, res)
            console.log(req.body)
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
        console.log(`Listening on port ${args[0]}`)
    }
}
