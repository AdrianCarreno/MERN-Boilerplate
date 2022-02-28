import { NextFunction, Response } from 'express'
import AccessControlServices from '@/services/accessControl.service'
import { RequestWithUser } from '@interfaces/auth.interface'
import { HttpException } from '@/exceptions/HttpException'
import roleModel from '@/models/roles.model'
import { Role } from '@/interfaces/roles.interface'
import { superAdmin } from '@/configs/roles.config'

/**
 * Middleware that grants or deny access
 * @param  {string=null} action action to perform
 * @param  {string=null} resource resource to access
 */
const grantAccess = function (action: string = null, resource: string = null) {
    return async (req: RequestWithUser, res: Response, next: NextFunction) => {
        // Check if the user has at least one role
        if (!Array.isArray(req.user.roles) || !req.user.roles.length) {
            return next(new HttpException(401, 'You do not have enough permission to perform this action'))
        }
        // Check if the user has a global Role
        const globalRoleFound: Role = req.user.roles.find(role => {
            return !role.organizationId
        })
        // If the use has a global role check if it has permission
        if (globalRoleFound) {
            const permission = AccessControlServices.check(globalRoleFound._id, resource, action)
            if (permission.granted) {
                req.role = globalRoleFound
                return next()
            }
        }
        try {
            let org = req.params.organizationId
            // if there is no organization in the request, search for role in request
            // and query the role, to get organization
            if (!org) {
                const roleId = req.params.roleId || req.body._id
                if (roleId) {
                    const findRoleData: Role = await roleModel.findById(roleId, 'organizationId')
                    org = findRoleData.organizationId.toString()
                }
            }
            // search if the user has a role that is assigned to the organization to make an action
            const roleFound = req.user.roles.find(obj => {
                if (obj.organizationId && org === obj.organizationId._id.toString()) {
                    return obj.organizationId
                } else return null
            })
            // if the user has a role that match an organization then check if it has permission
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

/**
 * Middleware that grants or deny access if the user is super admin
 */
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
