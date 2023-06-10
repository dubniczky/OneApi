# OneAPI

JSON object-based single-endpoint server API for JavaScript

## Overview

This API simplifies the creation of a fully JSON-based HTTP server by providing JSON field-based routing. This routing schema allows multi-dimensional routing strategies with more complex parameters than what normal HTTP headers and paths provide.

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

You can also specify multiple parameters for your routing. The following example chooses this path if both the `first` and `second` fields are present and contain the specified values.

```js
api.add({ first: 'a', second: 3 }, async (json) => {
    return { correct: true }
})
```

The OneAPI class uses the standard `http` module from NodeJS and exposes the raw request and response objects where you can check and manipulate headers. This is generally not recommended though, unless your application has to use some form of fixed authentication, such as cookies.

```js
api.add({ a: 'g' }, async (json, req, res) => {
    const customHeader = req.headers['custom-header']
    res.setHeader('custom-header', customHeader)

    return { correct: true }
})
```
