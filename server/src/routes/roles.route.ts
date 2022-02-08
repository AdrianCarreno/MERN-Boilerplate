import { Router } from 'express'
import { Routes } from '@interfaces/routes.interface'
import authMiddleware from '@/middlewares/auth.middleware'
import { grantAccess, superAdminAccess } from '@/middlewares/permission.middleware'
import {
    createGlobalRole,
    createRole,
    deleteRole,
    getAllRoles,
    getMyRoles,
    getRolesByOrg,
    updateRole
} from '@/controllers/roles.controller'
import validationMiddleware from '@/middlewares/validation.middleware'
import { CreateRoleDto, UpdateRoleDto, CreateGlobalRoleDto } from '@/dtos/roles.dto'

class RolesRoute implements Routes {
    public path = '/roles'
    public router = Router()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}/createRole/organization/:organizationId`,
            authMiddleware,
            grantAccess('createAny', 'RolePermission'),
            validationMiddleware(CreateRoleDto, 'body', true),
            createRole
        )
        this.router.post(
            `${this.path}/createGlobalRole/`,
            authMiddleware,
            superAdminAccess(),
            validationMiddleware(CreateGlobalRoleDto, 'body', true),
            createGlobalRole
        )
        this.router.put(
            `${this.path}/update/role/:roleId`,
            authMiddleware,
            grantAccess('updateAny', 'RolePermission'),
            validationMiddleware(UpdateRoleDto, 'body', true),
            updateRole
        )
        this.router.get(
            `${this.path}/getRolesById/organization/:organizationId`,
            authMiddleware,
            grantAccess('readAny', 'RolePermission'),
            getRolesByOrg
        )
        this.router.get(`${this.path}/getRoles`, authMiddleware, superAdminAccess(), getAllRoles)
        this.router.get(`${this.path}/getMyRoles`, authMiddleware, getMyRoles)

        this.router.delete(
            `${this.path}/delete/role/:roleId`,
            authMiddleware,
            grantAccess('deleteAny', 'RolePermission'),
            deleteRole
        )
    }
}

export default RolesRoute
