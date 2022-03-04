import { CreateOrgDto } from '@/dtos/organizations.dto'
import { RequestWithUser } from '@/interfaces/auth.interface'
import { Organization } from '@/interfaces/roles.interface'
import organizationsService from '@/services/organization.service'
import { NextFunction, Request, Response } from 'express'
/**
 * Creates a new organization
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const createOrg = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orgInfo: CreateOrgDto = req.body
        const newOrganization = await organizationsService.createOrganization(orgInfo)
        res.status(201).json({ data: newOrganization, message: 'created' })
    } catch (error) {
        next(error)
    }
}
/**
 * Get all existing organizations in the database
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const getAllOrgs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const findAllOrgs: Organization[] = await organizationsService.getOrganizations()
        res.status(200).json({ data: findAllOrgs, message: 'findOrganizations' })
    } catch (error) {
        next(error)
    }
}
/**
 * Get the organizations of a user
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
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
/**
 * Updates an organization
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const updateOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.params.organizationId
        const organizationData = req.body
        const updatedOrganization: Organization = await organizationsService.updateOrgById(
            organizationId,
            organizationData
        )
        res.status(200).json({ data: updatedOrganization, message: 'updated' })
    } catch (error) {
        next(error)
    }
}
/**
 * Deletes an organization
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const deleteOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const organizationId = req.params.organizationId
        const deletedOrg: Organization = await organizationsService.deleteOrgById(organizationId)
        res.status(200).json({ data: deletedOrg, message: 'deleted' })
    } catch (error) {
        next(error)
    }
}

export default { createOrg, getAllOrgs, updateOrganization, deleteOrganization, getMyOrgs }
