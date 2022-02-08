import { CreateOrgDto } from '@/dtos/organizations.dto'
import { RequestWithUser } from '@/interfaces/auth.interface'
import { Organization } from '@/interfaces/roles.interface'
import { createOrganization, deleteOrgById, getOrganizations, updateOrgById } from '@/services/organization.service'
import { NextFunction, Request, Response } from 'express'

const createOrg = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orgInfo: CreateOrgDto = req.body
        const newOrganization = await createOrganization(orgInfo)
        res.status(201).json({ data: newOrganization, message: 'created' })
    } catch (error) {
        next(error)
    }
}

const getAllOrgs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const findAllOrgs: Organization[] = await getOrganizations()
        res.status(200).json({ data: findAllOrgs, message: 'findOrganizations' })
    } catch (error) {
        next(error)
    }
}

const getMyOrgs = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        let findAllOrgs = req.user.roles.map(role => {
            if (role.organizationId) {
                return role.organizationId
            } else return null
        })
        findAllOrgs = findAllOrgs.filter(organization => organization) // remove null from array
        res.status(200).json({ data: findAllOrgs, message: 'findOrganizations' })
    } catch (error) {
        next(error)
    }
}

const updateOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = require('mongodb').ObjectId(req.params.organizationId)
        const organizationData = req.body
        const updatedOrganization: Organization = await updateOrgById(organizationId, organizationData)
        res.status(200).json({ data: updatedOrganization, message: 'updated' })
    } catch (error) {
        next(error)
    }
}

const deleteOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = require('mongodb').ObjectId(req.params.organizationId)
        const deletedOrg: Organization = await deleteOrgById(organizationId)
        res.status(200).json({ data: deletedOrg, message: 'deleted' })
    } catch (error) {
        next(error)
    }
}

export { createOrg, getAllOrgs, updateOrganization, deleteOrganization, getMyOrgs }
