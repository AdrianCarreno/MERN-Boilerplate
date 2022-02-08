import { NextFunction, Response } from 'express'
import AccessControlServices from '@/services/accessControl.service'
import { CreateRoleDto } from '@/dtos/roles.dto'
import { RequestWithUser } from '@/interfaces/auth.interface'
import { Role } from '@/interfaces/roles.interface'

const createRole = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        /*  */
        const rolesMatchs = Object.keys(req.body.resources).every(key => {
            return Object.keys(req.role.resources).includes(key)
        })

        const roleInfo: CreateRoleDto = req.body
        const newRole = await AccessControlServices.createRole(roleInfo, req.params.organizationId, rolesMatchs)
        res.status(201).json({ data: newRole, message: 'created' })
    } catch (error) {
        next(error)
    }
}

const createGlobalRole = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const rolesMatchs = Object.keys(req.body.resources).every(key => {
            return Object.keys(req.role.resources).includes(key)
        })

        const roleInfo: CreateRoleDto = req.body
        const newRole = await AccessControlServices.createGlobalRole(roleInfo, rolesMatchs)
        res.status(201).json({ data: newRole, message: 'created' })
    } catch (error) {
        next(error)
    }
}

const getRolesByOrg = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const orgIdObj = require('mongodb').ObjectId(req.params.organizationId)
        const findAllRoles: Role[] = await AccessControlServices.findRolesByOrg(orgIdObj)
        res.status(200).json({ data: findAllRoles, message: 'findRoles' })
    } catch (error) {
        next(error)
    }
}

const getAllRoles = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const findAllRoles: Role[] = await AccessControlServices.findAllRoles()
        res.status(200).json({ data: findAllRoles, message: 'findRoles' })
    } catch (error) {
        next(error)
    }
}

const getMyRoles = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const findMyRoles: Role[] = req.user.roles
        res.status(200).json({ data: findMyRoles, message: 'findRoles' })
    } catch (error) {
        next(error)
    }
}

const updateRole = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const roleId = require('mongodb').ObjectId(req.params.roleId)
        const roleData = req.body
        const updatedRole: Role = await AccessControlServices.updateRoleById(roleId, roleData)
        res.status(200).json({ data: updatedRole, message: 'updated' })
    } catch (error) {
        next(error)
    }
}

const deleteRole = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const roleId = require('mongodb').ObjectId(req.params.roleId)
        const deletedRole: Role = await AccessControlServices.deleteRole(roleId)
        res.status(200).json({ data: deletedRole, message: 'deleted' })
    } catch (error) {
        next(error)
    }
}

export { createRole, getRolesByOrg, getAllRoles, updateRole, deleteRole, createGlobalRole, getMyRoles }
