import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import request from 'supertest'
import App from '@/app'
import { addRoleDto, CreateUserDto, LoginUserDto, UpdateUserDto } from '@dtos/users.dto'
import roleModel from '@/models/roles.model'
import organizationModel from '@/models/organizations.model'
import { logger } from '@/utils/logger'
import routes from '@routes/index'
import userModel from '@/models/users.model'

afterAll(async () => {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500))
})

beforeAll(async () => {
    const loggerMock = logger
    loggerMock.error = jest.fn().mockReturnValue(null)
})

let token: string
let tokenWithOutPermission: string

const fullTestUser = {
    emailVerifiedAt: null,
    roles: ['61f7f6b2e299444350796a6e'],
    _id: '61f7f6b2e299444350796a6a',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'test@yopmail.com',
    password: '$2b$10$jOzZ0dL6wtGsEGldKfhxR.t/Zjxk0wFJW2LgCprpsM1U.DwvhMobi',
    fullName: 'Super Admin',
    name: 'Super Admin',
    id: '61f7f6b2e299444350796a6a'
}

const roleTest = [
    {
        _id: '61f7f6b2e299444350796a6e',
        name: 'SuperAdmin',
        resources: {
            User: {
                'create:any': ['*'],
                'read:any': ['*'],
                'update:any': ['*'],
                'delete:any': ['*']
            },
            RolePermission: {
                'create:any': ['*'],
                'read:any': ['*'],
                'update:any': ['*'],
                'delete:any': ['*']
            },
            OrganizationPermission: {
                'create:any': ['*'],
                'read:any': ['*'],
                'update:any': ['*'],
                'delete:any': ['*']
            }
        }
    }
]

const AuthPath = '/'
const UserPath = '/api/users'
const app = new App(routes)

describe('Testing Users with Login (SuperAdmin)', () => {
    beforeAll(async () => {
        const userData: LoginUserDto = {
            email: 'test@yopmail.com',
            password: 'Yourpassword1'
        }
        const users = userModel
        // find user and populate
        users.findById = jest
            .fn()
            .mockReturnValue({
                _id: '61f7f6b2e299444350796a6a',
                email: userData.email,
                password: await bcrypt.hash(userData.password, 10),
                roles: ['61f7f6b2e299444350796a6e']
            })
            .mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue({ ...fullTestUser, roles: roleTest })
            }))
        ;(mongoose as any).connect = jest.fn()
        users.findOne = jest.fn().mockReturnValue({
            _id: '61f7f6b2e299444350796a6a',
            email: userData.email,
            password: await bcrypt.hash(userData.password, 10),
            roles: ['61f7f6b2e299444350796a6e']
        })
        ;(mongoose as any).connect = jest.fn()
        // login plus save token
        return request(app.getServer())
            .post(`${AuthPath}login`)
            .send(userData)
            .expect('Set-Cookie', /^Authorization=.+/)
            .then(response => {
                token = response.body.token // save the token!
            })
    })

    describe('[GET] /users/user/:id', () => {
        it('response findOne User', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const users = userModel
            users.findOne = jest
                .fn()
                .mockReturnValue({
                    _id: '61f7f6b2e299444350796a6a',
                    firstName: 'Super',
                    lastName: 'Admin',
                    email: 'test@yopmail.com'
                })
                .mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue({
                        _id: '61f7f6b2e299444350796a6a',
                        firstName: 'Super',
                        lastName: 'Admin',
                        email: 'test@yopmail.com',
                        roles: ['61f7f6b2e299444350796a6e']
                    })
                }))
            ;(mongoose as any).connect = jest.fn()
            return await request(app.getServer())
                .get(`${UserPath}/user/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[GET] /users/', () => {
        it('response findOne User', async () => {
            const users = userModel
            users.findOne = jest
                .fn()
                .mockReturnValue({
                    _id: '61f7f6b2e299444350796a6a',
                    firstName: 'Super',
                    lastName: 'Admin',
                    email: 'test@yopmail.com'
                })
                .mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue({
                        _id: '61f7f6b2e299444350796a6a',
                        firstName: 'Super',
                        lastName: 'Admin',
                        email: 'test@yopmail.com',
                        roles: ['61f7f6b2e299444350796a6e']
                    })
                }))
            ;(mongoose as any).connect = jest.fn()
            return await request(app.getServer())
                .get(`${UserPath}/`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[GET] /users/getUsers', () => {
        it('response findAll Users', async () => {
            const users = userModel
            users.find = jest
                .fn()
                .mockReturnValue({
                    _id: '61f7f6b2e299444350796a6a',
                    firstName: 'Super',
                    lastName: 'Admin',
                    email: 'test@yopmail.com'
                })
                .mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue([
                        {
                            _id: '61f7f6b2e299444350796a6a',
                            firstName: 'Super',
                            lastName: 'Admin',
                            email: 'test@yopmail.com',
                            roles: ['61f7f6b2e299444350796a6e']
                        }
                    ])
                }))
            ;(mongoose as any).connect = jest.fn()
            return await request(app.getServer())
                .get(`${UserPath}/getUsers`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[GET] /users/organization/:organizationId/user/:id', () => {
        it('response findOne User', async () => {
            const userId = '61f7fa45ff48d95f2ca50dba'
            const organizationId = '61f7f6c6e299444350796a75'
            const users = userModel
            organizationModel.findById = jest.fn().mockReturnValue({
                _id: '61f7f6c6e299444350796a75',
                name: 'Organization test',
                description: 'description...'
            })

            users.findOne = jest
                .fn()
                .mockReturnValue({
                    _id: '61f7fa45ff48d95f2ca50dba',
                    firstName: 'user',
                    lastName: 'test',
                    email: 'test@yopmail.com'
                })
                .mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue({
                        _id: '61f7fa45ff48d95f2ca50dba',
                        firstName: 'user',
                        lastName: 'test',
                        email: 'test@yopmail.com',
                        roles: [
                            {
                                _id: '61f7f6d3e299444350796a7a',
                                organizationId: '61f7f6c6e299444350796a75',
                                name: 'roleName',
                                resources: 'resources'
                            }
                        ]
                    })
                }))
            ;(mongoose as any).connect = jest.fn()
            return await request(app.getServer())
                .get(`${UserPath}/organization/${organizationId}/user/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[GET] /users/organization/:organizationId', () => {
        it('response find Users', async () => {
            const organizationId = '61f7f6c6e299444350796a75'

            const users = userModel
            organizationModel.findById = jest.fn().mockReturnValue({
                _id: '61f7f6c6e299444350796a75',
                name: 'Organization test',
                description: 'description...'
            })
            users.find = jest
                .fn()
                .mockReturnValue({
                    _id: '61f7fa45ff48d95f2ca50dba',
                    firstName: 'user',
                    lastName: 'test',
                    email: 'test@yopmail.com'
                })
                .mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue([
                        {
                            _id: '61f7fa45ff48d95f2ca50dba',
                            firstName: 'user',
                            lastName: 'test',
                            email: 'test@yopmail.com',
                            roles: [
                                {
                                    _id: '61f7f6d3e299444350796a7a',
                                    organizationId: '61f7f6c6e299444350796a75',
                                    name: 'roleName',
                                    resources: 'resources'
                                }
                            ]
                        }
                    ])
                }))
            ;(mongoose as any).connect = jest.fn()

            return await request(app.getServer())
                .get(`${UserPath}/organization/${organizationId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[PUT] /users/user/:id', () => {
        it('response Update User', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const email = 'test@yopmail.com'
            const userData: UpdateUserDto = {
                firstName: 'Super',
                lastName: 'Admin',
                password: 'Yourpassword1',
                roles: [require('mongodb').ObjectId('61f7f6b2e299444350796a6e')]
            }
            const users = userModel

            users.findByIdAndUpdate = jest.fn().mockReturnValue({
                _id: userId,
                email: email,
                password: await bcrypt.hash(userData.password, 10)
            })
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .put(`${UserPath}/user/${userId}`)
                .send(userData)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[PUT] /users/addRole/user/:id', () => {
        it('response addRole to User', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const userData: addRoleDto = {
                _id: '61f7f6b2e299444350796a6c'
            }
            // Find role
            const roles = roleModel
            roles.findById = jest.fn().mockReturnValue({
                _id: '61f7f6b2e299444350796a6c',
                name: 'admin',
                organizationId: '61f7f6b2e299444350796a6o'
            })
            ;(mongoose as any).connect = jest.fn()
            // Authorization check

            const users = userModel
            users.findById = jest
                .fn()
                .mockReturnValue({
                    _id: userId,
                    firstName: 'Super',
                    lastName: 'Admin',
                    email: 'test@yopmail.com',
                    roles: ['61f7f6b2e299444350796a6e']
                })
                .mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue({
                        _id: userId,
                        firstName: 'Super',
                        lastName: 'Admin',
                        email: 'test@yopmail.com',
                        roles: [
                            {
                                _id: '61f7f6b2e299444350796a6e',
                                name: 'SuperAdmin'
                            }
                        ]
                    })
                }))
            ;(mongoose as any).connect = jest.fn()
            // Add role to user
            users.findOneAndUpdate = jest.fn().mockReturnValue({
                _id: userId,
                email: 'test@yopmail.com',
                password: await bcrypt.hash('Yourpassword1', 10),
                roles: ['61f7f6b2e299444350796a6e', '61f7f6b2e299444350796a6c']
            })
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .put(`${UserPath}/addRole/user/${userId}`)
                .send(userData)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[PUT] /users/removeRole/user/:id', () => {
        it('response addRole to User', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const userData: addRoleDto = {
                _id: '61f7f6b2e299444350796a6c'
            }
            // Search for Role
            const roles = roleModel
            roles.findById = jest.fn().mockReturnValue({
                _id: '61f7f6b2e299444350796a6c',
                name: 'admin',
                organizationId: '61f7f6b2e299444350796a6o'
            })
            ;(mongoose as any).connect = jest.fn()

            const users = userModel
            // Authorization check
            users.findById = jest
                .fn()
                .mockReturnValue({
                    _id: userId,
                    firstName: 'Super',
                    lastName: 'Admin',
                    email: 'test@yopmail.com',
                    roles: [
                        ...roleTest,
                        { _id: '61f7f6b2e299444350796a6c', name: 'admin', organizationId: '61f7f6b2e299444350796a6o' }
                    ]
                })
                .mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue({
                        ...fullTestUser,
                        roles: [
                            ...roleTest,
                            {
                                _id: '61f7f6b2e299444350796a6c',
                                name: 'admin',
                                organizationId: '61f7f6b2e299444350796a6o'
                            }
                        ]
                    })
                }))
            ;(mongoose as any).connect = jest.fn()
            // Remove role
            users.findOneAndUpdate = jest.fn().mockReturnValue({
                _id: userId,
                firstName: 'Super',
                lastName: 'Admin',
                email: 'test@yopmail.com',
                roles: ['61f7f6b2e299444350796a6e']
            })
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .put(`${UserPath}/removeRole/user/${userId}`)
                .send(userData)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[DELETE] /users/user/:id', () => {
        it('response Delete User', async () => {
            const userId = '61f7f6b2e299444350796a6a'

            const users = userModel

            users.findByIdAndDelete = jest.fn().mockReturnValue({
                _id: userId,
                firstName: 'Super',
                lastName: 'Admin',
                email: 'test@yopmail.com',
                password: await bcrypt.hash('Yourpassword1', 10)
            })
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .delete(`${UserPath}/user/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })
})

describe('Testing Users Without Login', () => {
    describe('[GET] /users/user/:id', () => {
        it('response Wrong authentication token', async () => {
            const userId = '61f7f6b2e299444350796a6a'

            return await request(app.getServer()).get(`${UserPath}/user/${userId}`).expect(401)
        })
    })

    describe('[GET] /users/', () => {
        it('response Wrong authentication token', async () => {
            return await request(app.getServer()).get(`${UserPath}/`).expect(401)
        })
    })

    describe('[GET] /users/getUsers', () => {
        it('response Wrong authentication token', async () => {
            return await request(app.getServer()).get(`${UserPath}/getUsers`).expect(401)
        })
    })

    describe('[GET] /users/organization/:organizationId/user/:id', () => {
        it('response Wrong authentication token', async () => {
            const userId = '61f7fa45ff48d95f2ca50dba'
            const organizationId = '61f7f6c6e299444350796a75'

            return await request(app.getServer())
                .get(`${UserPath}/organization/${organizationId}/user/${userId}`)
                .expect(401)
        })
    })

    describe('[GET] /users/organization/:organizationId', () => {
        it('response Wrong authentication token', async () => {
            const organizationId = '61f7f6c6e299444350796a75'

            return await request(app.getServer()).get(`${UserPath}/organization/${organizationId}`).expect(401)
        })
    })

    describe('[PUT] /users/user/:id', () => {
        it('response Wrong authentication token', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const userData: CreateUserDto = {
                firstName: 'Super',
                lastName: 'Admin',
                email: 'test@yopmail.com',
                password: 'Yourpassword1',
                roles: ['61f7f6b2e299444350796a6e']
            }

            return request(app.getServer()).put(`${UserPath}/user/${userId}`).send(userData).expect(401)
        })
    })

    describe('[PUT] /users/addRole/user/:id', () => {
        it('response Wrong authentication token', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const userData: addRoleDto = {
                _id: '61f7f6b2e299444350796a6c'
            }

            return request(app.getServer()).put(`${UserPath}/addRole/user/${userId}`).send(userData).expect(401)
        })
    })

    describe('[PUT] /users/removeRole/user/:id', () => {
        it('response Wrong authentication token', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const userData: addRoleDto = {
                _id: '61f7f6b2e299444350796a6c'
            }

            return request(app.getServer()).put(`${UserPath}/removeRole/user/${userId}`).send(userData).expect(401)
        })
    })

    describe('[DELETE] /users/user/:id', () => {
        it('response Wrong authentication token', async () => {
            const userId = '61f7f6b2e299444350796a6a'

            return request(app.getServer()).delete(`${UserPath}/user/${userId}`).expect(401)
        })
    })
})

describe('Testing Users with Login without permission', () => {
    beforeAll(async () => {
        const userData: LoginUserDto = {
            email: 'test@yopmail.com',
            password: 'Yourpassword1'
        }
        const users = userModel
        // find user and populate
        users.findById = jest
            .fn()
            .mockReturnValue({
                _id: '61f7f6b2e299444350796a6a',
                email: userData.email,
                password: await bcrypt.hash(userData.password, 10),
                roles: []
            })
            .mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue({ ...fullTestUser, roles: [] })
            }))
        ;(mongoose as any).connect = jest.fn()
        users.findOne = jest.fn().mockReturnValue({
            _id: '61f7f6b2e299444350796a6a',
            email: userData.email,
            password: await bcrypt.hash(userData.password, 10),
            roles: []
        })
        ;(mongoose as any).connect = jest.fn()
        // login plus save token
        return request(app.getServer())
            .post(`${AuthPath}login`)
            .send(userData)
            .expect('Set-Cookie', /^Authorization=.+/)
            .then(response => {
                tokenWithOutPermission = response.body.token // save the token!
            })
    })
    describe('[GET] /users/user/:id', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const userId = '61f7f6b2e299444350796a6a'

            return await request(app.getServer())
                .get(`${UserPath}/user/${userId}`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[GET] /users/', () => {
        it('response find user information by header', async () => {
            const users = userModel
            users.findOne = jest
                .fn()
                .mockReturnValue({
                    _id: '61f7f6b2e299444350796a6a',
                    firstName: 'User',
                    lastName: 'Test',
                    email: 'test@yopmail.com'
                })
                .mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue({
                        _id: '61f7f6b2e299444350796a6a',
                        firstName: 'User',
                        lastName: 'Test',
                        email: 'test@yopmail.com',
                        roles: []
                    })
                }))
            ;(mongoose as any).connect = jest.fn()

            return await request(app.getServer())
                .get(`${UserPath}/`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(200)
        })
    })

    describe('[GET] /users/getUsers', () => {
        it('response You do not have enough permission to perform this action', async () => {
            return await request(app.getServer())
                .get(`${UserPath}/getUsers`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[GET] /users/organization/:organizationId/user/:id', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const userId = '61f7fa45ff48d95f2ca50dba'
            const organizationId = '61f7f6c6e299444350796a75'

            return await request(app.getServer())
                .get(`${UserPath}/organization/${organizationId}/user/${userId}`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[GET] /users/organization/:organizationId', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const organizationId = '61f7f6c6e299444350796a75'

            return await request(app.getServer())
                .get(`${UserPath}/organization/${organizationId}`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[PUT] /users/user/:id', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const userData: UpdateUserDto = {
                firstName: 'Super',
                lastName: 'Admin',
                password: 'Yourpassword1',
                roles: [require('mongodb').ObjectId('61f7f6b2e299444350796a6e')]
            }

            return request(app.getServer())
                .put(`${UserPath}/user/${userId}`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .send(userData)
                .expect(401)
        })
    })

    describe('[PUT] /users/addRole/user/:id', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const userData: addRoleDto = {
                _id: '61f7f6b2e299444350796a6c'
            }

            return request(app.getServer())
                .put(`${UserPath}/addRole/user/${userId}`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .send(userData)
                .expect(401)
        })
    })

    describe('[PUT] /users/removeRole/user/:id', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const userData: addRoleDto = {
                _id: '61f7f6b2e299444350796a6c'
            }

            return request(app.getServer())
                .put(`${UserPath}/removeRole/user/${userId}`)
                .send(userData)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[DELETE] /users/user/:id', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const userId = '61f7f6b2e299444350796a6a'

            return request(app.getServer())
                .delete(`${UserPath}/user/${userId}`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })
})
