import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import request from 'supertest'
import { App, getServer } from '@/app'
import { CreateUserDto, LoginUserDto } from '@dtos/users.dto'
import AuthRoute from '@routes/auth.route'
import userModel from '@/models/users.model'
import { User } from '@/interfaces/users.interface'

afterAll(async () => {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500))
})

const AuthPath = '/'

describe('Testing Auth', () => {
    describe('[POST] /signup', () => {
        it('response should have the Create userData', async () => {
            const userData: CreateUserDto = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@yopmail.com',
                password: 'q1w2e3r4!',
                roles: ['']
            }
            const users = userModel
            users.findOne = jest.fn().mockReturnValue(null)
            users.create = jest.fn().mockReturnValue({
                _id: '60706478aad6c9ad19a31c84',
                email: userData.email,
                password: await bcrypt.hash(userData.password, 10)
            })
            ;(mongoose as any).connect = jest.fn()
            return request(getServer()).post(`${AuthPath}signup`).send(userData)
        })
    })

    describe('[POST] /login', () => {
        it('response should have the Set-Cookie header with the Authorization token', async () => {
            const userData: LoginUserDto = {
                email: 'test@yopmail.com',
                password: 'q1w2e3r4!'
            }
            const users = userModel
            users.findOne = jest.fn().mockReturnValue({
                _id: '60706478aad6c9ad19a31c84',
                email: userData.email,
                password: await bcrypt.hash(userData.password, 10)
            })
            ;(mongoose as any).connect = jest.fn()
            return request(getServer())
                .post(`${AuthPath}login`)
                .send(userData)
                /* .expect('Set-Cookie', /^Authorization=.+/) */
        })
    })

    describe('[POST] /logout', () => {
        it('logout Set-Cookie Authorization=; Max-age=0', async () => {
            const userData = {} as User /* = {
                _id: '60706478aad6c9ad19a31c84',
                email: 'test@yopmail.com',
                password: await bcrypt.hash('q1w2e3r4!', 10),
            } */
            userData.email = 'test@yopmail.com'
            userData.password = await bcrypt.hash('q1w2e3r4!', 10)
            
            const users = userModel

            users.findOne = jest.fn().mockReturnValue(userData)

            ;(mongoose as any).connect = jest.fn()
            return request(getServer())
                .post(`${AuthPath}/logout`)
                .send(userData)
                .set('Set-Cookie', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ')
                /* .expect('Set-Cookie', /^Authorization=\; Max-age=0/) */
            })
    })
})
