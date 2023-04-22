import { describe, test } from '@jest/globals'
import request from 'supertest'

import { OneApi } from "./oneapi.js"


function sendJson(oneapi, json) {
    return request(oneapi.server)
        .post('/')
        .set('Accept', 'application/json')
        .send(json)
}


describe('Server creation', () => {

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
})