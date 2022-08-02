import { GraphQLList } from 'graphql'

import organizationsService from '@/services/organization.service'
import { OrganizationsType } from '../types/index'
import { Organization } from '@/interfaces/roles.interface'
import { grantAccessGraphQL } from '../permission'
import { HttpException } from '@/exceptions/HttpException'
import { __ } from 'i18n'

export default {
    myOrganizations: {
        description: 'Allows to query the database for self **Orgnizations** information.',
        type: new GraphQLList(OrganizationsType),
        async resolve(parent, args, context) {
            let findAllOrgs: Organization[] = context.user.roles.map(role => {
                if (role.organizationId) {
                    return role.organizationId
                } else return null
            })
            findAllOrgs = findAllOrgs.filter(organization => organization)
            return findAllOrgs
        }
    },
    allOrganizations: {
        description:
            'Allows to query the database for **Orgnizations**. Requires administrative read permissions to access.',
        type: new GraphQLList(OrganizationsType),
        async resolve(parents, args, context) {
            const locale = context.cookieLanguage
            const permission = await grantAccessGraphQL(context.user, {}, 'readAny', 'OrganizationPermission')
            if (permission?.access) {
                return organizationsService.getOrganizations()
            } else {
                throw new HttpException(
                    409,
                    __({ phrase: 'You do not have enough permission to perform this action', locale })
                )
            }
        }
    }
}
