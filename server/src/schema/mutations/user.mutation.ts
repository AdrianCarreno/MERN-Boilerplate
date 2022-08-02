import { GraphQLID, GraphQLNonNull } from 'graphql'
import usersService from '@/services/users.service'
import { UsersType } from '../types/index'
import { HttpException } from '@exceptions/HttpException'
import { __ } from 'i18n'
import { grantAccessGraphQL, superAdminAccessGraphQl } from '../permission'
import { UserCreationInputType, UserUpdateInputType } from '../types/user.type'
import { Role } from '@/interfaces/roles.interface'
import roleModel from '@/models/roles.model'

export default {
    createUser: {
        description:
            'Allows to mutate the database to create an **User** information. Requires administrative create permissions to access.',
        type: UsersType,
        args: {
            userData: { type: UserCreationInputType }
        },
        async resolve(parent, args, context) {
            const locale = context.cookieLanguage
            const permission = await grantAccessGraphQL(context.user, {}, 'createAny', 'RolePermission')
            if (permission?.access) {
                return usersService.createUser(args.userData)
            } else {
                throw new HttpException(
                    409,
                    __({ phrase: 'You do not have enough permission to perform this action', locale })
                )
            }
        }
    },
    updateUser: {
        description:
            'Allows to mutate the database to update an **User** information. Requires administrative update permissions to access.',
        type: UsersType,
        args: {
            userId: { type: new GraphQLNonNull(GraphQLID) },
            userData: { type: UserUpdateInputType }
        },
        async resolve(parent, { userId, userData }, context) {
            const locale = context.cookieLanguage
            const permission = await grantAccessGraphQL(context.user, {}, 'updateAny', 'RolePermission')
            if (permission?.access) {
                return usersService.updateUser(userId, userData)
            } else {
                throw new HttpException(
                    409,
                    __({ phrase: 'You do not have enough permission to perform this action', locale })
                )
            }
        }
    },
    deleteUser: {
        description:
            'Allows to mutate the database to delete an **User**. Requires administrative delete permissions to access.',
        type: UsersType,
        args: {
            userId: { type: new GraphQLNonNull(GraphQLID) }
        },
        async resolve(parent, { userId }, context) {
            const locale = context.cookieLanguage
            const permission = await superAdminAccessGraphQl(context.user)
            if (permission?.access) {
                return usersService.deleteUser(userId)
            } else {
                throw new HttpException(
                    409,
                    __({ phrase: 'You do not have enough permission to perform this action', locale })
                )
            }
        }
    },
    addRoleToUser: {
        description:
            'Allows to mutate the database to add a **Role** to an **User**. Requires administrative Role permissions to access.',
        type: UsersType,
        args: {
            userId: { type: new GraphQLNonNull(GraphQLID) },
            roleId: { type: new GraphQLNonNull(GraphQLID) }
        },
        async resolve(parent, { userId, roleId }, context) {
            const locale = context.cookieLanguage
            const permission = await grantAccessGraphQL(context.user, { roleId }, 'createAny', 'RolePermission')
            if (permission?.access) {
                const findRole: Role = await roleModel.findById(roleId)
                if (!findRole) throw new HttpException(409, __({ phrase: 'Role not found', locale }))
                const findMatch = context.user.roles.find(role => {
                    if (role._id) {
                        return role._id.toString() === findRole._id.toString()
                    } else return null
                })
                if (!findMatch) {
                    if (!permission.role)
                        throw new HttpException(409, __({ phrase: 'You do not belong to this organization', locale }))
                }
                return usersService.addRoleToUser(userId, findRole)
            } else {
                throw new HttpException(
                    409,
                    __({ phrase: 'You do not have enough permission to perform this action', locale })
                )
            }
        }
    },
    removeRoleToUser: {
        description:
            'Allows to mutate the database to remove a **Role** to an **User**. Requires administrative Role permissions to access.',
        type: UsersType,
        args: {
            userId: { type: new GraphQLNonNull(GraphQLID) },
            roleId: { type: new GraphQLNonNull(GraphQLID) }
        },
        async resolve(parent, { userId, roleId }, context) {
            const locale = context.cookieLanguage
            const permission = await grantAccessGraphQL(context.user, { roleId }, 'createAny', 'RolePermission')

            if (permission?.access) {
                const findRole: Role = await roleModel.findById(roleId)
                if (!findRole) throw new HttpException(409, __({ phrase: 'Role not found', locale }))
                const findMatch = context.user.roles.find(role => {
                    if (role._id) {
                        return role._id.toString() === findRole._id.toString()
                    } else return null
                })
                if (!findMatch) {
                    if (!permission.role)
                        throw new HttpException(409, __({ phrase: 'You do not belong to this organization', locale }))
                }
                return usersService.removeRoleToUser(userId, findRole)
            } else {
                throw new HttpException(
                    409,
                    __({ phrase: 'You do not have enough permission to perform this action', locale })
                )
            }
        }
    }
}
