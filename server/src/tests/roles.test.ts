import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import request from 'supertest'
import App from '@/app'
import { LoginUserDto } from '@dtos/users.dto'
import AuthRoute from '@/routes/auth.route'
import RolesRoute from '@/routes/roles.route'
import { CreateRoleDto, UpdateRoleDto } from '@/dtos/roles.dto'
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

const roleTest2 = [
    {
        _id: '61f7f6b2e299444350796a6c',
        name: 'user',
        organizationId: {
            _id: '61f7f6c6e299444350796a75',
            name: 'orgTest1',
            description: 'description test'
        },
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
            }
        }
    }
]

const concatRoles = [...roleTest, ...roleTest2]

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
                populate: jest.fn().mockResolvedValue({ ...fullTestUser, roles: concatRoles })
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

    describe('[Post] /roles/createRole/organization/:organizationId', () => {
        it('response create role', async () => {
            const organizationId = '61f7f6c6e299444350796a75'
            const roleId = '61f7f6b2e299444350796a6c'
            const rolesRoute = new RolesRoute()
            const app = new App([rolesRoute])
            organizationModel.findById = jest.fn().mockReturnValue({
                _id: '61f7f6c6e299444350796a75',
                name: 'organizationTest',
                description: 'description test'
            })
            ;(mongoose as any).connect = jest.fn()
            const roleData: CreateRoleDto = {
                name: 'newRoleToTest',
                description: 'Description Test',
                organizationId: require('mongodb').ObjectId(roleId),
                resources: roleTest2[0].resources
            }
            roleModel.find = jest.fn().mockReturnValue(roleTest)
            ;(mongoose as any).connect = jest.fn()

            // roleModel.findOne = jest.fn().mockReturnValue(null)
            roleModel.create = jest.fn().mockReturnValue(roleData)
            ;(mongoose as any).connect = jest.fn()
            return request(app.getServer())
                .post(`${rolesRoute.path}/createRole/organization/${organizationId}`)
                .send(roleData)
                .set('Authorization', `Bearer ${token}`)
                .expect(201)
        })
    })

    describe('[Post] /roles/createGlobalRole', () => {
        it('response create global role', async () => {
            const rolesRoute = new RolesRoute()
            const app = new App([rolesRoute])
            const roleData: CreateRoleDto = {
                name: 'newRoleToTest',
                description: 'Description Test',
                resources: roleTest2[0].resources
            }
            roleModel.find = jest.fn().mockReturnValue(roleTest)
            ;(mongoose as any).connect = jest.fn()

            // roleModel.findOne = jest.fn().mockReturnValue(null)
            roleModel.create = jest.fn().mockReturnValue(roleData)
            ;(mongoose as any).connect = jest.fn()
            return request(app.getServer())
                .post(`${rolesRoute.path}/createGlobalRole`)
                .send(roleData)
                .set('Authorization', `Bearer ${token}`)
                .expect(201)
        })
    })

    describe('[PUT] /roles/update/role/:roleId', () => {
        it('response Update Organization', async () => {
            const rolesRoute = new RolesRoute()
            const app = new App([rolesRoute])
            const roleId = '61f7f6b2e299444350796a6c'
            const roleData: UpdateRoleDto = {
                name: 'OrganizationTest',
                description: 'Description Test',
                resources: roleTest2[0].resources
            }

            roleModel.findByIdAndUpdate = jest.fn().mockReturnValue({
                _id: '61f7f6c6e299444350796a75',
                name: roleData.name,
                description: roleData.description,
                resources: roleTest2[0].resources
            })
            ;(mongoose as any).connect = jest.fn()

            roleModel.find = jest.fn().mockReturnValue([
                {
                    _id: '61f7f6c6e299444350796a75',
                    name: roleData.name,
                    description: roleData.description,
                    resources: roleTest2[0].resources
                }
            ])
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .put(`${rolesRoute.path}/update/role/${roleId}`)
                .send(roleData)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[GET] /roles/getRolesById/organization/:organizationId', () => {
        it('response find Roles by organization', async () => {
            const organizationId = '61f7f6c6e299444350796a75'
            const roleRoute = new RolesRoute()
            const app = new App([roleRoute])

            roleModel.find = jest
                .fn()
                .mockReturnValue(roleTest2)
                .mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue(roleTest2)
                }))
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .get(`${roleRoute.path}/getRolesById/organization/${organizationId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[GET] /roles/getRoles', () => {
        it('response findAll Roles', async () => {
            const roleRoute = new RolesRoute()
            const app = new App([roleRoute])

            roleModel.find = jest
                .fn()
                .mockReturnValue(concatRoles)
                .mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue(concatRoles)
                }))
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .get(`${roleRoute.path}/getRoles`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[GET] /role/getMyRoles', () => {
        it('response find roles by header', async () => {
            const roleRoute = new RolesRoute()
            const app = new App([roleRoute])

            return request(app.getServer())
                .get(`${roleRoute.path}/getMyRoles`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })
    describe('[DELETE] /roles/delete/role/:roleId', () => {
        it('response deleted role', async () => {
            const rolesRoute = new RolesRoute()
            const app = new App([rolesRoute])
            const roleId = '61f7f6b2e299444350796a6c'

            roleModel.findByIdAndDelete = jest.fn().mockReturnValue({
                _id: roleId,
                name: 'OrganizationTest',
                description: 'Description Test',
                resources: roleTest2[0].resources
            })
            ;(mongoose as any).connect = jest.fn()

            roleModel.find = jest.fn().mockReturnValue(concatRoles)
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .delete(`${rolesRoute.path}/delete/role/${roleId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })
})

describe('Testing Users without Login', () => {
    describe('[Post] /roles/createRole/organization/:organizationId', () => {
        it('response Wrong authentication token', async () => {
            const organizationId = '61f7f6c6e299444350796a75'
            const roleId = '61f7f6b2e299444350796a6c'
            const rolesRoute = new RolesRoute()
            const app = new App([rolesRoute])
            organizationModel.findById = jest.fn().mockReturnValue({
                _id: '61f7f6c6e299444350796a75',
                name: 'organizationTest',
                description: 'description test'
            })
            ;(mongoose as any).connect = jest.fn()
            const roleData: CreateRoleDto = {
                name: 'newRoleToTest',
                description: 'Description Test',
                organizationId: require('mongodb').ObjectId(roleId),
                resources: roleTest2[0].resources
            }
            roleModel.find = jest.fn().mockReturnValue(roleTest)
            ;(mongoose as any).connect = jest.fn()

            roleModel.create = jest.fn().mockReturnValue(roleData)
            ;(mongoose as any).connect = jest.fn()
            return request(app.getServer())
                .post(`${rolesRoute.path}/createRole/organization/${organizationId}`)
                .send(roleData)
                .expect(401)
        })
    })

    describe('[Post] /roles/createGlobalRole', () => {
        it('response Wrong authentication token', async () => {
            const rolesRoute = new RolesRoute()
            const app = new App([rolesRoute])
            const roleData: CreateRoleDto = {
                name: 'newRoleToTest',
                description: 'Description Test',
                resources: roleTest2[0].resources
            }
            roleModel.find = jest.fn().mockReturnValue(roleTest)
            ;(mongoose as any).connect = jest.fn()

            roleModel.create = jest.fn().mockReturnValue(roleData)
            ;(mongoose as any).connect = jest.fn()
            return request(app.getServer()).post(`${rolesRoute.path}/createGlobalRole`).send(roleData).expect(401)
        })
    })

    describe('[PUT] /roles/update/role/:roleId', () => {
        it('response Wrong authentication token', async () => {
            const rolesRoute = new RolesRoute()
            const app = new App([rolesRoute])
            const roleId = '61f7f6b2e299444350796a6c'
            const roleData: UpdateRoleDto = {
                name: 'OrganizationTest',
                description: 'Description Test',
                resources: roleTest2[0].resources
            }

            roleModel.findByIdAndUpdate = jest.fn().mockReturnValue({
                _id: '61f7f6c6e299444350796a75',
                name: roleData.name,
                description: roleData.description,
                resources: roleTest2[0].resources
            })
            ;(mongoose as any).connect = jest.fn()

            roleModel.find = jest.fn().mockReturnValue([
                {
                    _id: '61f7f6c6e299444350796a75',
                    name: roleData.name,
                    description: roleData.description,
                    resources: roleTest2[0].resources
                }
            ])
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer()).put(`${rolesRoute.path}/update/role/${roleId}`).send(roleData).expect(401)
        })
    })

    describe('[GET] /roles/getRolesById/organization/:organizationId', () => {
        it('response Wrong authentication token', async () => {
            const organizationId = '61f7f6c6e299444350796a75'
            const roleRoute = new RolesRoute()
            const app = new App([roleRoute])

            roleModel.find = jest
                .fn()
                .mockReturnValue(roleTest2)
                .mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue(roleTest2)
                }))
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .get(`${roleRoute.path}/getRolesById/organization/${organizationId}`)
                .expect(401)
        })
    })

    describe('[GET] /roles/getRoles', () => {
        it('response Wrong authentication token', async () => {
            const roleRoute = new RolesRoute()
            const app = new App([roleRoute])

            roleModel.find = jest
                .fn()
                .mockReturnValue(concatRoles)
                .mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue(concatRoles)
                }))
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer()).get(`${roleRoute.path}/getRoles`).expect(401)
        })
    })

    describe('[GET] /role/getMyRoles', () => {
        it('response Wrong authentication token', async () => {
            const roleRoute = new RolesRoute()
            const app = new App([roleRoute])

            return request(app.getServer()).get(`${roleRoute.path}/getMyRoles`).expect(401)
        })
    })
    describe('[DELETE] /roles/delete/role/:roleId', () => {
        it('response Wrong authentication token', async () => {
            const rolesRoute = new RolesRoute()
            const app = new App([rolesRoute])
            const roleId = '61f7f6b2e299444350796a6c'

            roleModel.findByIdAndDelete = jest.fn().mockReturnValue({
                _id: roleId,
                name: 'OrganizationTest',
                description: 'Description Test',
                resources: roleTest2[0].resources
            })
            ;(mongoose as any).connect = jest.fn()

            roleModel.find = jest.fn().mockReturnValue(concatRoles)
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer()).delete(`${rolesRoute.path}/delete/role/${roleId}`).expect(401)
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
    describe('[Post] /roles/createRole/organization/:organizationId', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const organizationId = '61f7f6c6e299444350796a75'
            const roleId = '61f7f6b2e299444350796a6c'
            const rolesRoute = new RolesRoute()
            const app = new App([rolesRoute])
            organizationModel.findById = jest.fn().mockReturnValue({
                _id: '61f7f6c6e299444350796a75',
                name: 'organizationTest',
                description: 'description test'
            })
            ;(mongoose as any).connect = jest.fn()
            const roleData: CreateRoleDto = {
                name: 'newRoleToTest',
                description: 'Description Test',
                organizationId: require('mongodb').ObjectId(roleId),
                resources: roleTest2[0].resources
            }
            roleModel.find = jest.fn().mockReturnValue(roleTest)
            ;(mongoose as any).connect = jest.fn()

            roleModel.create = jest.fn().mockReturnValue(roleData)
            ;(mongoose as any).connect = jest.fn()
            return request(app.getServer())
                .post(`${rolesRoute.path}/createRole/organization/${organizationId}`)
                .send(roleData)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[Post] /roles/createGlobalRole', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const rolesRoute = new RolesRoute()
            const app = new App([rolesRoute])
            const roleData: CreateRoleDto = {
                name: 'newRoleToTest',
                description: 'Description Test',
                resources: roleTest2[0].resources
            }
            roleModel.find = jest.fn().mockReturnValue(roleTest)
            ;(mongoose as any).connect = jest.fn()

            // roleModel.findOne = jest.fn().mockReturnValue(null)
            roleModel.create = jest.fn().mockReturnValue(roleData)
            ;(mongoose as any).connect = jest.fn()
            return request(app.getServer())
                .post(`${rolesRoute.path}/createGlobalRole`)
                .send(roleData)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[PUT] /roles/update/role/:roleId', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const rolesRoute = new RolesRoute()
            const app = new App([rolesRoute])
            const roleId = '61f7f6b2e299444350796a6c'
            const roleData: UpdateRoleDto = {
                name: 'OrganizationTest',
                description: 'Description Test',
                resources: roleTest2[0].resources
            }

            roleModel.findByIdAndUpdate = jest.fn().mockReturnValue({
                _id: '61f7f6c6e299444350796a75',
                name: roleData.name,
                description: roleData.description,
                resources: roleTest2[0].resources
            })
            ;(mongoose as any).connect = jest.fn()

            roleModel.find = jest.fn().mockReturnValue([
                {
                    _id: '61f7f6c6e299444350796a75',
                    name: roleData.name,
                    description: roleData.description,
                    resources: roleTest2[0].resources
                }
            ])
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .put(`${rolesRoute.path}/update/role/${roleId}`)
                .send(roleData)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[GET] /roles/getRolesById/organization/:organizationId', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const organizationId = '61f7f6c6e299444350796a75'
            const roleRoute = new RolesRoute()
            const app = new App([roleRoute])

            roleModel.find = jest
                .fn()
                .mockReturnValue(roleTest2)
                .mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue(roleTest2)
                }))
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .get(`${roleRoute.path}/getRolesById/organization/${organizationId}`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[GET] /roles/getRoles', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const roleRoute = new RolesRoute()
            const app = new App([roleRoute])

            roleModel.find = jest
                .fn()
                .mockReturnValue(concatRoles)
                .mockImplementation(() => ({
                    populate: jest.fn().mockResolvedValue(concatRoles)
                }))
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .get(`${roleRoute.path}/getRoles`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })

    describe('[GET] /role/getMyRoles', () => {
        it('response find roles by header', async () => {
            const roleRoute = new RolesRoute()
            const app = new App([roleRoute])

            return request(app.getServer())
                .get(`${roleRoute.path}/getMyRoles`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
        })
    })

    describe('[DELETE] /roles/delete/role/:roleId', () => {
        it('response You do not have enough permission to perform this action', async () => {
            const rolesRoute = new RolesRoute()
            const app = new App([rolesRoute])
            const roleId = '61f7f6b2e299444350796a6c'

            roleModel.findByIdAndDelete = jest.fn().mockReturnValue({
                _id: roleId,
                name: 'OrganizationTest',
                description: 'Description Test',
                resources: roleTest2[0].resources
            })
            ;(mongoose as any).connect = jest.fn()

            roleModel.find = jest.fn().mockReturnValue(concatRoles)
            ;(mongoose as any).connect = jest.fn()

            return request(app.getServer())
                .delete(`${rolesRoute.path}/delete/role/${roleId}`)
                .set('Authorization', `Bearer ${tokenWithOutPermission}`)
                .expect(401)
        })
    })
})
