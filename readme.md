# OneAPI

SON object-based single-endpoint server API

## Overview

This API simplifies the creation of a fully JSON-based HTTP server creation by providing JSON member-based routing. This routing schema allows multi-dimensional routing strategies with multiple or more complex parameters than what normal HTTP headers and paths provide.

## Example

```js
import { OneApi } from "./oneapi.js"

// Create server object
const api = new OneApi()

// Apply middleware
api.use(async (json) => {
    json['middleware'] = true
    return null
})

// Add routes
api.add({ type: 'ping' }, async (json) => {
    return { type: 'pong' }
})

api.add({ type: 'echo' }, async (json) => {
    return json
})

api.default(async (json) => {
    return { test: 'nopath'}
})


// Start listening on port
api.listen(3000)
```