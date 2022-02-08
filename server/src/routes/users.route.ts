import { Router } from 'express'
import UsersController from '@controllers/users.controller'
import { addRoleDto, CreateUserDto } from '@dtos/users.dto'
import { Routes } from '@interfaces/routes.interface'
import validationMiddleware from '@middlewares/validation.middleware'
import authMiddleware from '@/middlewares/auth.middleware'
import { grantAccess, superAdminAccess } from '@/middlewares/permission.middleware'

class UsersRoute implements Routes {
    public path = '/api/users'
    public router = Router()
    public usersController = new UsersController()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/getUsers`, authMiddleware, superAdminAccess(), this.usersController.getUsers)
        this.router.get(`${this.path}/`, authMiddleware, this.usersController.getUserByHeader)
        this.router.get(
            `${this.path}/user/:id`,
            authMiddleware,
            grantAccess('readAny', 'User'),
            this.usersController.getUserById
        )
        this.router.get(
            `${this.path}/organization/:organizationId/user/:id`,
            authMiddleware,
            grantAccess('readAny', 'User'),
            this.usersController.getUserByIdByOrg
        )
        this.router.get(
            `${this.path}/organization/:organizationId`,
            authMiddleware,
            grantAccess('readAny', 'User'),
            this.usersController.getUsersByOrganization
        )
        this.router.put(
            `${this.path}/user/:id`,
            authMiddleware,
            validationMiddleware(CreateUserDto, 'body', true),
            superAdminAccess(),
            this.usersController.updateUser
        )
        this.router.put(
            `${this.path}/addRole/user/:id`,
            authMiddleware,
            validationMiddleware(addRoleDto, 'body', true),
            grantAccess('updateAny', 'User'),
            this.usersController.addRoleToUser
        )
        this.router.put(
            `${this.path}/removeRole/user/:id`,
            authMiddleware,
            validationMiddleware(addRoleDto, 'body', true),
            grantAccess('updateAny', 'User'),
            this.usersController.removeRoleToUser
        )
        this.router.delete(`${this.path}/user/:id`, authMiddleware, superAdminAccess(), this.usersController.deleteUser)
    }
}

export default UsersRoute
