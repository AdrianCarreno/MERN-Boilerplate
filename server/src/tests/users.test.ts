import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import request from 'supertest'
import App from '@/app'
import { addRoleDto, CreateUserDto, LoginUserDto } from '@dtos/users.dto'
import UsersRoute from '@routes/users.route'
import AuthRoute from '@/routes/auth.route'
import roleModel from '@/models/roles.model'
import organizationModel from '@/models/organizations.model'
import { logger } from '@/utils/logger'

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

describe('Testing Users with Login (SuperAdmin)', () => {
    beforeAll(async () => {
        const userData: LoginUserDto = {
            email: 'test@yopmail.com',
            password: 'Yourpassword1'
        }
        const authRoute = new AuthRoute()
        const users = authRoute.authController.authService.users
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
        const app = new App([authRoute])
        // login plus save token
        return request(app.getServer())
            .post(`${authRoute.path}login`)
            .send(userData)
            .expect('Set-Cookie', /^Authorization=.+/)
            .then(response => {
                token = response.body.token // save the token!
            })
    })

    describe('[GET] /users/user/:id', () => {
        it('response findOne User', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const usersRoute = new UsersRoute()
            const users = usersRoute.usersController.userService.users

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
            const app = new App([usersRoute])
            return await request(app.getServer())
                .get(`${usersRoute.path}/user/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[GET] /users/', () => {
        it('response findOne User', async () => {
            const usersRoute = new UsersRoute()
            const users = usersRoute.usersController.userService.users

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
            const app = new App([usersRoute])
            return await request(app.getServer())
                .get(`${usersRoute.path}/`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[GET] /users/getUsers', () => {
        it('response findAll Users', async () => {
            const usersRoute = new UsersRoute()
            const users = usersRoute.usersController.userService.users

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
            const app = new App([usersRoute])
            return await request(app.getServer())
                .get(`${usersRoute.path}/getUsers`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[GET] /users/organization/:organizationId/user/:id', () => {
        it('response findOne User', async () => {
            const userId = '61f7fa45ff48d95f2ca50dba'
            const organizationId = '61f7f6c6e299444350796a75'
            const usersRoute = new UsersRoute()
            const users = usersRoute.usersController.userService.users
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
            const app = new App([usersRoute])
            return await request(app.getServer())
                .get(`${usersRoute.path}/organization/${organizationId}/user/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[GET] /users/organization/:organizationId', () => {
        it('response find Users', async () => {
            const organizationId = '61f7f6c6e299444350796a75'
            const usersRoute = new UsersRoute()
            const users = usersRoute.usersController.userService.users
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

            const app = new App([usersRoute])
            return await request(app.getServer())
                .get(`${usersRoute.path}/organization/${organizationId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[PUT] /users/user/:id', () => {
        it('response Update User', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const userData: CreateUserDto = {
                firstName: 'Super',
                lastName: 'Admin',
                email: 'test@yopmail.com',
                password: 'Yourpassword1',
                roles: ['61f7f6b2e299444350796a6e']
            }

            const usersRoute = new UsersRoute()
            const users = usersRoute.usersController.userService.users
            if (userData.email) {
                users.findOne = jest.fn().mockReturnValue({
                    _id: userId,
                    email: userData.email,
                    password: await bcrypt.hash(userData.password, 10)
                })
                ;(mongoose as any).connect = jest.fn()
            }

            users.findByIdAndUpdate = jest.fn().mockReturnValue({
                _id: userId,
                email: userData.email,
                password: await bcrypt.hash(userData.password, 10)
            })
            ;(mongoose as any).connect = jest.fn()
            const app = new App([usersRoute])
            return request(app.getServer())
                .put(`${usersRoute.path}/user/${userId}`)
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
            const usersRoute = new UsersRoute()
            const users = usersRoute.usersController.userService.users
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

            const app = new App([usersRoute])
            return request(app.getServer())
                .put(`${usersRoute.path}/addRole/user/${userId}`)
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

            const usersRoute = new UsersRoute()
            const users = usersRoute.usersController.userService.users
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
            const app = new App([usersRoute])
            return request(app.getServer())
                .put(`${usersRoute.path}/removeRole/user/${userId}`)
                .send(userData)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[DELETE] /users/user/:id', () => {
        it('response Delete User', async () => {
            const userId = '61f7f6b2e299444350796a6a'

            const usersRoute = new UsersRoute()
            const users = usersRoute.usersController.userService.users

            users.findByIdAndDelete = jest.fn().mockReturnValue({
                _id: userId,
                firstName: 'Super',
                lastName: 'Admin',
                email: 'test@yopmail.com',
                password: await bcrypt.hash('Yourpassword1', 10)
            })
            ;(mongoose as any).connect = jest.fn()
            const app = new App([usersRoute])
            return request(app.getServer())
                .delete(`${usersRoute.path}/user/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })
})

describe('Testing Users Without Login', () => {
    describe('[GET] /users/user/:id', () => {
        it('response Wrong authentication token', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const usersRoute = new UsersRoute()
            const app = new App([usersRoute])
            return await request(app.getServer()).get(`${usersRoute.path}/user/${userId}`).expect(401)
        })
    })

    describe('[GET] /users/', () => {
        it('response Wrong authentication token', async () => {
            const usersRoute = new UsersRoute()

            const app = new App([usersRoute])
            return await request(app.getServer()).get(`${usersRoute.path}/`).expect(401)
        })
    })

    describe('[GET] /users/getUsers', () => {
        it('response Wrong authentication token', async () => {
            const usersRoute = new UsersRoute()

            const app = new App([usersRoute])
            return await request(app.getServer()).get(`${usersRoute.path}/getUsers`).expect(401)
        })
    })

    describe('[GET] /users/organization/:organizationId/user/:id', () => {
        it('response Wrong authentication token', async () => {
            const userId = '61f7fa45ff48d95f2ca50dba'
            const organizationId = '61f7f6c6e299444350796a75'
            const usersRoute = new UsersRoute()
            const app = new App([usersRoute])
            return await request(app.getServer())
                .get(`${usersRoute.path}/organization/${organizationId}/user/${userId}`)
                .expect(401)
        })
    })

    describe('[GET] /users/organization/:organizationId', () => {
        it('response Wrong authentication token', async () => {
            const organizationId = '61f7f6c6e299444350796a75'
            const usersRoute = new UsersRoute()
            const app = new App([usersRoute])
            return await request(app.getServer()).get(`${usersRoute.path}/organization/${organizationId}`).expect(401)
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

            const usersRoute = new UsersRoute()
            const app = new App([usersRoute])
            return request(app.getServer()).put(`${usersRoute.path}/user/${userId}`).send(userData).expect(401)
        })
    })

    describe('[PUT] /users/addRole/user/:id', () => {
        it('response Wrong authentication token', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const userData: addRoleDto = {
                _id: '61f7f6b2e299444350796a6c'
            }
            const usersRoute = new UsersRoute()
            const app = new App([usersRoute])
            return request(app.getServer()).put(`${usersRoute.path}/addRole/user/${userId}`).send(userData).expect(401)
        })
    })

    describe('[PUT] /users/removeRole/user/:id', () => {
        it('response Wrong authentication token', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const userData: addRoleDto = {
                _id: '61f7f6b2e299444350796a6c'
            }
            const usersRoute = new UsersRoute()
            const app = new App([usersRoute])
            return request(app.getServer())
                .put(`${usersRoute.path}/removeRole/user/${userId}`)
                .send(userData)
                .expect(401)
        })
    })

    describe('[DELETE] /users/user/:id', () => {
        it('response Wrong authentication token', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const usersRoute = new UsersRoute()
            const app = new App([usersRoute])
            return request(app.getServer()).delete(`${usersRoute.path}/user/${userId}`).expect(401)
        })
    })
})

describe('Testing Users with Login without permission', () => {
    beforeAll(async () => {
        const userData: LoginUserDto = {
            email: 'test@yopmail.com',
            password: 'Yourpassword1'
        }
        const authRoute = new AuthRoute()
        const users = authRoute.authController.authService.users
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
        const app = new App([authRoute])
        // login plus save token
        return request(app.getServer())
            .post(`${authRoute.path}login`)
            .send(userData)
            .expect('Set-Cookie', /^Authorization=.+/)
            .then(response => {
                tokenWithOutPermission = response.body.token // save the token!
            })
    })
    describe('[GET] /users/user/:id', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const usersRoute = new UsersRoute()
            const app = new App([usersRoute])
            return await request(app.getServer())
                .get(`${usersRoute.path}/user/${userId}`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[GET] /users/', () => {
        it('response find user information by header', async () => {
            const usersRoute = new UsersRoute()
            const users = usersRoute.usersController.userService.users
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
            const app = new App([usersRoute])
            return await request(app.getServer())
                .get(`${usersRoute.path}/`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(200)
        })
    })

    describe('[GET] /users/getUsers', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const usersRoute = new UsersRoute()

            const app = new App([usersRoute])
            return await request(app.getServer())
                .get(`${usersRoute.path}/getUsers`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[GET] /users/organization/:organizationId/user/:id', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const userId = '61f7fa45ff48d95f2ca50dba'
            const organizationId = '61f7f6c6e299444350796a75'
            const usersRoute = new UsersRoute()
            const app = new App([usersRoute])
            return await request(app.getServer())
                .get(`${usersRoute.path}/organization/${organizationId}/user/${userId}`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[GET] /users/organization/:organizationId', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const organizationId = '61f7f6c6e299444350796a75'
            const usersRoute = new UsersRoute()
            const app = new App([usersRoute])
            return await request(app.getServer())
                .get(`${usersRoute.path}/organization/${organizationId}`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[PUT] /users/user/:id', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const userData: CreateUserDto = {
                firstName: 'Super',
                lastName: 'Admin',
                email: 'test@yopmail.com',
                password: 'Yourpassword1',
                roles: ['61f7f6b2e299444350796a6e']
            }

            const usersRoute = new UsersRoute()
            const app = new App([usersRoute])
            return request(app.getServer())
                .put(`${usersRoute.path}/user/${userId}`)
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
            const usersRoute = new UsersRoute()
            const app = new App([usersRoute])
            return request(app.getServer())
                .put(`${usersRoute.path}/addRole/user/${userId}`)
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
            const usersRoute = new UsersRoute()
            const app = new App([usersRoute])
            return request(app.getServer())
                .put(`${usersRoute.path}/removeRole/user/${userId}`)
                .send(userData)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[DELETE] /users/user/:id', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const userId = '61f7f6b2e299444350796a6a'
            const usersRoute = new UsersRoute()
            const app = new App([usersRoute])
            return request(app.getServer())
                .delete(`${usersRoute.path}/user/${userId}`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })
})
