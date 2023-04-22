import { describe, test } from '@jest/globals'
import request from 'supertest'

import { OneApi } from "./oneapi.js"


function sendJson(oneapi, json) {
    return request(oneapi.server)
        .post('/')
        .set('Accept', 'application/json')
        .send(json)
}


describe('Integration tests', () => {

    test('Server object is created', () => {
        const api = new OneApi()
        expect(api).not.toBe(null)
        expect(api.server).not.toBe(null)
    })

    test('Responds to ping pong', () => {
        const api = new OneApi()
        
        api.add({ type: 'ping' }, async (json) => {
            return { type: 'pong' }
        })

        sendJson(api, { type: 'ping' })
            .then((res) => {
                expect(res.body).toEqual({ type: 'pong' })
            })
    })

    test('Responds with one custom value', () => {
        const api = new OneApi()
        
        api.add({ type: 'random' }, async (json) => {
            return { random: json.random }
        })

        const rand = Math.floor(Math.random() * 1000)
        sendJson(api, { type: 'random', random: rand })
            .then((res) => {
                expect(res.body.random).toEqual(rand)
            })
    })

    test('Responds with to echo with exact object', () => {
        const api = new OneApi()
        
        api.add({ type: 'echo' }, async (json) => {
            return json
        })

        const data = {
            type: 'echo',
            a: 1,
            b: false,
            c: 'hello',
            d: [1, 2, 3],
            e: { a: 1, b: 2, c: 3 },
            f: null
        }

        sendJson(api, data)
            .then((res) => {
                expect(res.body).toEqual(data)
            })
    })
})