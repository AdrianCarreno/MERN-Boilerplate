import { Router } from 'express'
import { Routes } from '@interfaces/routes.interface'
import authMiddleware from '@/middlewares/auth.middleware'
import { grantAccess, superAdminAccess } from '@/middlewares/permission.middleware'
import {
    createOrg,
    deleteOrganization,
    getAllOrgs,
    getMyOrgs,
    updateOrganization
} from '@/controllers/organizations.controller'
import validationMiddleware from '@/middlewares/validation.middleware'
import { CreateOrgDto, UpdateOrgDto } from '@/dtos/organizations.dto'

class OrganizationsRoute implements Routes {
    public path = '/organizations'
    public router = Router()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}/createOrg`,
            authMiddleware,
            grantAccess('PermissionOrganization', 'createAny'),
            validationMiddleware(CreateOrgDto, 'body', true),
            createOrg
        )
        this.router.put(
            `${this.path}/update/organization/:organizationId`,
            authMiddleware,
            grantAccess('PermissionOrganization', 'updateAny'),
            validationMiddleware(UpdateOrgDto, 'body', true),
            updateOrganization
        )
        this.router.get(`${this.path}/getOrganizations`, authMiddleware, superAdminAccess(), getAllOrgs)

        this.router.get(`${this.path}/getMyOrganizations`, authMiddleware, getMyOrgs)

        this.router.delete(
            `${this.path}/delete/organization/:organizationId`,
            authMiddleware,
            superAdminAccess(),
            deleteOrganization
        )
    }
}

export default OrganizationsRoute
