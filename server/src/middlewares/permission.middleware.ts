import { NextFunction, Response } from 'express'
import AccessControlServices from '@/services/accessControl.service'
import { RequestWithUser } from '@interfaces/auth.interface'
import { HttpException } from '@/exceptions/HttpException'
import roleModel from '@/models/roles.model'
import { Role } from '@/interfaces/roles.interface'
import { superAdmin } from '@/configs/roles.config'

const grantAccess = function (action: string = null, resource: string = null) {
    return async (req: RequestWithUser, res: Response, next: NextFunction) => {
        if (!Array.isArray(req.user.roles) || !req.user.roles.length) {
            return next(new HttpException(401, 'You do not have enough permission to perform this action'))
        }
        const globalRoleFound: Role = req.user.roles.find(role => {
            return !role.organizationId
        })
        if (globalRoleFound && globalRoleFound.name === superAdmin.name) {
            next()
            req.role = globalRoleFound
            return
        }
        if (globalRoleFound) {
            const permission = AccessControlServices.check(globalRoleFound._id, resource, action)
            if (permission.granted) {
                req.role = globalRoleFound
                return next()
            }
        }
        try {
            let org = req.params.organizationId

            if (!org) {
                const roleId = req.params.roleId || req.body._id
                if (roleId) {
                    const findRoleData: Role = await roleModel.findById(roleId)
                    org = findRoleData.organizationId.toString()
                }
            }
            const roleFound = req.user.roles.find(obj => {
                if (obj.organizationId && org === obj.organizationId._id.toString()) {
                    return obj.organizationId
                } else return null
            })
            if (roleFound) {
                const permission = AccessControlServices.check(roleFound._id, resource, action)
                if (!permission.granted) {
                    return next(new HttpException(401, 'You do not have enough permission to perform this action'))
                }
            } else {
                return next(new HttpException(401, 'You do not have enough permission to perform this action'))
            }
            req.role = roleFound
            return next()
        } catch {
            return next(new HttpException(401, 'You do not have enough permission to perform this action'))
        }
    }
}

const superAdminAccess = function () {
    return async (req: RequestWithUser, res: Response, next: NextFunction) => {
        if (!Array.isArray(req.user.roles) || !req.user.roles.length)
            next(new HttpException(401, 'You do not have enough permission to perform this action'))
        try {
            const superAdminFound: Role = req.user.roles.find(role => {
                return role.name === superAdmin.name && !role.organizationId
            })
            if (superAdminFound) {
                next()
                req.role = superAdminFound
                return
            } else {
                return next(new HttpException(401, 'You do not have enough permission to perform this action'))
            }
        } catch (error) {
            return next(new HttpException(401, 'You do not have enough permission to perform this action'))
        }
    }
}

export { grantAccess, superAdminAccess }
