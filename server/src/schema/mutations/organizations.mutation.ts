import { GraphQLBoolean, GraphQLID, GraphQLNonNull } from 'graphql'
import organizationsService from '@/services/organization.service'
import { OrganizationsType, OrganizationsInputType } from '../types/index'
import { grantAccessGraphQL, superAdminAccessGraphQl } from '../permission'
import { HttpException } from '@/exceptions/HttpException'
import { __ } from 'i18n'

export default {
    createOrganization: {
        description: 'Allows to mutate the database to create an **Organization** information.',
        type: OrganizationsType,
        args: {
            organizationData: { type: OrganizationsInputType }
        },
        async resolve(parent, { organizationData }, context) {
            const locale = context.cookieLanguage
            const permission = superAdminAccessGraphQl(context.user)
            if (permission?.access) {
                return organizationsService.createOrganization(organizationData)
            } else {
                throw new HttpException(
                    409,
                    __({ phrase: 'You do not have enough permission to perform this action', locale })
                )
            }
        }
    },
    updateOrganization: {
        description: 'Allows to mutate the database to update an **Organization** information.',
        type: OrganizationsType,
        args: {
            organizationId: { type: new GraphQLNonNull(GraphQLID) },
            organizationData: { type: OrganizationsInputType },
            enabled: { type: GraphQLBoolean }
        },
        async resolve(parent, { organizationId, organizationData }, context) {
            const locale = context.cookieLanguage
            const permission = await grantAccessGraphQL(
                context.user,
                { organizationId },
                'createAny',
                'OrganizationPermission'
            )
            if (permission?.access) {
                return organizationsService.updateOrgById(organizationId, organizationData)
            } else {
                throw new HttpException(
                    409,
                    __({ phrase: 'You do not have enough permission to perform this action', locale })
                )
            }
        }
    },
    deleteOrganization: {
        description: 'Allows to mutate the database to delete an **Organization**',
        type: OrganizationsType,
        args: {
            organizationId: { type: new GraphQLNonNull(GraphQLID) }
        },
        async resolve(parent, { organizationId }, context) {
            const locale = context.cookieLanguage
            const permission = superAdminAccessGraphQl(context.user)
            if (permission?.access) {
                return organizationsService.deleteOrgById(organizationId)
            } else {
                throw new HttpException(
                    409,
                    __({ phrase: 'You do not have enough permission to perform this action', locale })
                )
            }
        }
    }
}
