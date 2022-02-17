import { __ } from 'i18n'
import { env } from '@/configs'
import { CreateOrgDto } from '@/dtos/organizations.dto'
import OrganizationModel from '@/models/organizations.model'
import { HttpException } from '@/exceptions/HttpException'

const createOrganization = async (orgInfo: CreateOrgDto, locale: string = env.locale) => {
    const newOrganization = OrganizationModel.create(orgInfo)
    if (!newOrganization)
        throw new HttpException(
            409,
            __({ phrase: 'Organization {{name}} already exists', locale }, { name: orgInfo.name })
        )
    return newOrganization
}

const deleteOrgById = async (organizationId: string, locale: string = env.locale) => {
    const deleted = await OrganizationModel.findByIdAndDelete(organizationId)
    if (!deleted) throw new HttpException(404, __({ phrase: 'Oganization not found', locale }))
    return deleted
}
const getOrganizations = async () => {
    const organizations = await OrganizationModel.find()
    return organizations
}

const updateOrgById = async (organizationId: string, organizationData: object, locale: string = env.locale) => {
    const updated = await OrganizationModel.findByIdAndUpdate(organizationId, organizationData, { new: true })
    if (!updated) throw new HttpException(404, __({ phrase: 'Oganization not found', locale }))
    return updated
}

export { createOrganization, deleteOrgById, getOrganizations, updateOrgById }
