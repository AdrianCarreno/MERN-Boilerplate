import { GraphQLID, GraphQLNonNull } from 'graphql'

import AccessControlServices from '@/services/accessControl.service'
import { RolesType } from '../types/index'
import { rolesInputType } from '../types/role.type'
import { grantAccessGraphQL } from '../permission'
import { HttpException } from '@/exceptions/HttpException'
import { __ } from 'i18n'

export default {
    createRole: {
        description:
            'Allows to mutate the database to create a **Role** information. Requires administrative create permissions to access.',
        type: RolesType,
        args: {
            roleData: { type: rolesInputType },
            organizationId: { type: GraphQLID }
        },
        async resolve(parent, { roleData, organizationId }, context) {
            const permission = await grantAccessGraphQL(
                context.user,
                { roleData, organizationId },
                'createAny',
                'RolePermission'
            )
            const locale = context.cookieLanguage
            if (permission?.access) {
                const parsedResources = {}
                roleData.resources.forEach(resource => {
                    if (!parsedResources[resource.resourceName]) {
                        parsedResources[resource.resourceName] = {}
                    }

                    parsedResources[resource.resourceName] = {
                        ...parsedResources[resource.resourceName],
                        [`${resource.resourceAction}`]: resource.resourceAttributes
                    }
                })
                roleData.resources = parsedResources
                const rolesMatchs = Object.keys(roleData.resources).every(key => {
                    return Object.keys(permission.role.resources).includes(key)
                })
                let newRole = null
                if (organizationId)
                    newRole = await AccessControlServices.createRole(roleData, organizationId, rolesMatchs)
                else if (permission.isSuperAdmin)
                    newRole = await AccessControlServices.createGlobalRole(roleData, rolesMatchs)
                else
                    throw new HttpException(
                        409,
                        __({ phrase: 'You do not have permission to create that role', locale })
                    )
                return newRole
            } else
                throw new HttpException(409, __({ phrase: 'You do not have permission to create that role', locale }))
        }
    },
    updateRole: {
        description:
            'Allows to mutate the database to update a **Role** information. Requires administrative update permissions to access.',
        type: RolesType,
        args: {
            roleData: { type: rolesInputType },
            organizationId: { type: GraphQLID }
        },
        async resolve(parent, { roleData, organizationId }, context) {
            const permission = await grantAccessGraphQL(
                context.user,
                { roleData, organizationId },
                'createAny',
                'RolePermission'
            )
            const locale = context.cookieLanguage
            if (permission?.access) {
                const parsedResources = {}
                roleData.resources.forEach(resource => {
                    if (!parsedResources[resource.resourceName]) {
                        parsedResources[resource.resourceName] = {}
                    }

                    parsedResources[resource.resourceName] = {
                        ...parsedResources[resource.resourceName],
                        [`${resource.resourceAction}`]: resource.resourceAttributes
                    }
                })
                roleData.resources = parsedResources
                const rolesMatchs = Object.keys(roleData.resources).every(key => {
                    return Object.keys(permission.role.resources).includes(key)
                })
                if (rolesMatchs) {
                    const updatedRole = await AccessControlServices.updateRole(roleData)
                    return updatedRole
                } else
                    throw new HttpException(
                        409,
                        __({ phrase: 'You do not have permission to update that role', locale })
                    )
            } else
                throw new HttpException(409, __({ phrase: 'You do not have permission to update that role', locale }))
        }
    },
    deleteRole: {
        description:
            'Allows to mutate the database to delete a **Role**. Requires administrative delete permissions to access.',
        type: RolesType,
        args: {
            roleId: { type: new GraphQLNonNull(GraphQLID) }
        },
        async resolve(parent, { roleId }, context) {
            const locale = context.cookieLanguage
            const permission = await grantAccessGraphQL(context.user, { roleId }, 'deleteAny', 'RolePermission')
            if (permission?.access) {
                return AccessControlServices.deleteRole(roleId)
            } else {
                throw new HttpException(409, __({ phrase: 'You do not have permission to delete that role', locale }))
            }
        }
    }
}
