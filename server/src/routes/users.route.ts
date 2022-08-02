import { Router } from 'express'
import UsersController from '@controllers/users.controller'
import { addRoleDto, UpdateUserDto } from '@dtos/users.dto'
import validationMiddleware from '@middlewares/validation.middleware'
import authMiddleware from '@/middlewares/auth.middleware'
import { grantAccess, superAdminAccess } from '@/middlewares/permission.middleware'

const router = Router()
router.get(`/getUsers`, authMiddleware(), superAdminAccess(), UsersController.getUsers)
router.get(`/`, authMiddleware(), UsersController.getUserByHeader)
router.get(`/user/:id`, authMiddleware(), grantAccess('readAny', 'User'), UsersController.getUserById)
router.get(
    `/organization/:organizationId/user/:id`,
    authMiddleware(),
    grantAccess('readAny', 'User'),
    UsersController.getUserByIdByOrg
)
router.get(
    `/organization/:organizationId`,
    authMiddleware(),
    grantAccess('readAny', 'User'),
    UsersController.getUsersByOrganization
)
router.put(
    `/user/:id`,
    authMiddleware(),
    validationMiddleware(UpdateUserDto, 'body', true),
    superAdminAccess(),
    UsersController.updateUser
)
router.put(
    `/addRole/user/:id`,
    authMiddleware(),
    validationMiddleware(addRoleDto, 'body', true),
    grantAccess('updateAny', 'User'),
    UsersController.addRoleToUser
)
router.put(
    `/removeRole/user/:id`,
    authMiddleware(),
    validationMiddleware(addRoleDto, 'body', true),
    grantAccess('updateAny', 'User'),
    UsersController.removeRoleToUser
)
router.delete(`/user/:id`, authMiddleware(), superAdminAccess(), UsersController.deleteUser)

export default router
