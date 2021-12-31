import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import request from 'supertest'
import App from '@/app'
import { CreateUserDto } from '@dtos/users.dto'
import UsersRoute from '@routes/users.route'

afterAll(async () => {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500))
})

describe('Testing Users', () => {
    describe('[GET] /users/:id', () => {
        it('response findOne User', async () => {
            const userId = 'qpwoeiruty'

            const usersRoute = new UsersRoute()
            const users = usersRoute.usersController.userService.users

            users.findOne = jest.fn().mockReturnValue({
                _id: 'qpwoeiruty',
                firstName: 'John',
                lastName: 'Doe',
                email: 'a@email.com',
                password: await bcrypt.hash('q1w2e3r4!', 10)
            })
            ;(mongoose as any).connect = jest.fn()
            const app = new App([usersRoute])
            return request(app.getServer()).get(`${usersRoute.path}/${userId}`).expect(200)
        })
    })

    describe('[PUT] /users/:id', () => {
        it('response Update User', async () => {
            const userId = '60706478aad6c9ad19a31c84'
            const userData: CreateUserDto = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@email.com',
                password: 'q1w2e3r4'
            }

            const usersRoute = new UsersRoute()
            const users = usersRoute.usersController.userService.users

            if (userData.email) {
                users.findOne = jest.fn().mockReturnValue({
                    _id: userId,
                    email: userData.email,
                    password: await bcrypt.hash(userData.password, 10)
                })
            }

            users.findByIdAndUpdate = jest.fn().mockReturnValue({
                _id: userId,
                email: userData.email,
                password: await bcrypt.hash(userData.password, 10)
            })
            ;(mongoose as any).connect = jest.fn()
            const app = new App([usersRoute])
            return request(app.getServer()).put(`${usersRoute.path}/${userId}`).send(userData)
        })
    })

    describe('[DELETE] /users/:id', () => {
        it('response Delete User', async () => {
            const userId = '60706478aad6c9ad19a31c84'

            const usersRoute = new UsersRoute()
            const users = usersRoute.usersController.userService.users

            users.findByIdAndDelete = jest.fn().mockReturnValue({
                _id: '60706478aad6c9ad19a31c84',
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@email.com',
                password: await bcrypt.hash('q1w2e3r4!', 10)
            })
            ;(mongoose as any).connect = jest.fn()
            const app = new App([usersRoute])
            return request(app.getServer()).delete(`${usersRoute.path}/${userId}`).expect(200)
        })
    })
})
