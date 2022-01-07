import request from 'supertest'
import App from '@/app'
import IndexRoute from '@routes/index.route'
import { disconnect } from 'mongoose'

afterAll(async () => {
    await disconnect()
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500))
})

describe('Testing Index', () => {
    describe('[GET] /', () => {
        it('response statusCode 200', () => {
            const indexRoute = new IndexRoute()
            const app = new App([indexRoute])

            return request(app.getServer()).get(`${indexRoute.path}`).expect(200)
        })
    })
})
