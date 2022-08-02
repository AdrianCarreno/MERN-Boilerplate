import { Router } from 'express'
import authMiddleware from '@/middlewares/auth.middleware'
import { grantAccess, superAdminAccess } from '@/middlewares/permission.middleware'
import OrganizationController from '@/controllers/organizations.controller'
import validationMiddleware from '@/middlewares/validation.middleware'
import { CreateOrgDto, UpdateOrgDto } from '@/dtos/organizations.dto'

const router = Router()
router.post(
    `/createOrg`,
    authMiddleware(),
    grantAccess('createAny', 'OrganizationPermission'),
    validationMiddleware(CreateOrgDto, 'body', true),
    OrganizationController.createOrg
)
router.put(
    `/update/organization/:organizationId`,
    authMiddleware(),
    grantAccess('updateAny', 'OrganizationPermission'),
    validationMiddleware(UpdateOrgDto, 'body', true),
    OrganizationController.updateOrganization
)
router.get(`/getOrganizations`, authMiddleware(), superAdminAccess(), OrganizationController.getAllOrgs)
router.get(`/getMyOrganizations`, authMiddleware(), OrganizationController.getMyOrgs)
router.delete(
    `/delete/organization/:organizationId`,
    authMiddleware(),
    superAdminAccess(),
    OrganizationController.deleteOrganization
)

export default router
