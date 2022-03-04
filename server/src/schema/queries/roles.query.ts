import { GraphQLID, GraphQLList } from 'graphql'

import RolesModel from '@/models/roles.model'
import { RolesType } from '../types'
import { grantAccessGraphQL } from '../permission'
import { HttpException } from '@/exceptions/HttpException'
import { __ } from 'i18n'
import AccessControlServices from '@/services/accessControl.service'

export default {
    myRoles: {
        description: 'Allows to query the database for self **Roles** information.',
        type: new GraphQLList(RolesType),
        async resolve(parent, args, context) {
            return context.user.roles
        }
    },
    allRoles: {
        description:
            'Allows to query the database for all **Roles**. Requires administrative read permissions to access.',
        type: new GraphQLList(RolesType),
        async resolve(context) {
            const locale = context.cookieLanguage
            const permission = await grantAccessGraphQL(context.user, {}, 'readAny', 'RolePermission')
            if (permission?.access) {
                const findPermissions = await RolesModel.find({})
                return findPermissions
            } else
                throw new HttpException(
                    409,
                    __({ phrase: 'You do not have enough permission to perform this action', locale })
                )
        }
    },
    rolesByOrg: {
        description:
            'Allows to query the database for **Roles** in an **Organization**. Requires administrative read permissions to access.',
        type: new GraphQLList(RolesType),
        args: {
            organizationId: { type: GraphQLID }
        },
        async resolve(parent, { organizationId }, context) {
            const locale = context.cookieLanguage
            const permission = await grantAccessGraphQL(context.user, {}, 'readAny', 'RolePermission')
            if (permission?.access) {
                const findPermissions = await AccessControlServices.findRolesByOrg(organizationId)
                return findPermissions
            } else
                throw new HttpException(
                    409,
                    __({ phrase: 'You do not have enough permission to perform this action', locale })
                )
        }
    }
}
