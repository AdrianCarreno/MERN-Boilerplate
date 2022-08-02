import { Router } from 'express'
import authMiddleware from '@/middlewares/auth.middleware'
import { grantAccess, superAdminAccess } from '@/middlewares/permission.middleware'
import RolesController from '@/controllers/roles.controller'
import validationMiddleware from '@/middlewares/validation.middleware'
import { CreateRoleDto, UpdateRoleDto, CreateGlobalRoleDto } from '@/dtos/roles.dto'

const router = Router()

router.post(
    `/createRole/organization/:organizationId`,
    authMiddleware(),
    grantAccess('createAny', 'RolePermission'),
    validationMiddleware(CreateRoleDto, 'body', true),
    RolesController.createRole
)
router.post(
    `/createGlobalRole/`,
    authMiddleware(),
    superAdminAccess(),
    validationMiddleware(CreateGlobalRoleDto, 'body', true),
    RolesController.createGlobalRole
)
router.put(
    `/update/role/:roleId`,
    authMiddleware(),
    grantAccess('updateAny', 'RolePermission'),
    validationMiddleware(UpdateRoleDto, 'body', true),
    RolesController.updateRole
)
router.get(
    `/getRolesById/organization/:organizationId`,
    authMiddleware(),
    grantAccess('readAny', 'RolePermission'),
    RolesController.getRolesByOrg
)
router.get(`/getRoles`, authMiddleware(), superAdminAccess(), RolesController.getAllRoles)
router.get(`/getMyRoles`, authMiddleware(), RolesController.getMyRoles)
router.delete(
    `/delete/role/:roleId`,
    authMiddleware(),
    grantAccess('deleteAny', 'RolePermission'),
    RolesController.deleteRole
)

export default router
