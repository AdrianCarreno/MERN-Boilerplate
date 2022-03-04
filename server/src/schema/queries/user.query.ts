import { GraphQLID, GraphQLList } from 'graphql'
import UsersModel from '@/models/users.model'
import { UsersType } from '../types'
import usersService from '@/services/users.service'
import { grantAccessGraphQL, superAdminAccessGraphQl } from '../permission'
import { HttpException } from '@/exceptions/HttpException'
import { __ } from 'i18n'

export default {
    myUser: {
        description: 'Allows to query the database for self **Users** information.',
        type: UsersType,
        async resolve(parent, args, context) {
            const findUser = await UsersModel.findById(context.user._id).populate({
                path: 'roles',
                model: 'Role',
                populate: { path: 'organizationId', model: 'Organization' }
            })
            return findUser
        }
    },
    allUsers: {
        description: 'Allows to query the database for **Users**. Requires administrative read permissions to access.',
        type: new GraphQLList(UsersType),
        async resolve(parent, args, context) {
            const locale = context.cookieLanguage
            const permission = superAdminAccessGraphQl(context.user)
            if (permission?.access) {
                const findUsers = await UsersModel.find({}).populate({
                    path: 'roles',
                    model: 'Role',
                    populate: { path: 'organizationId', model: 'Organization' }
                })
                return findUsers
            } else {
                throw new HttpException(
                    409,
                    __({ phrase: 'You do not have enough permission to perform this action', locale })
                )
            }
        }
    },
    userById: {
        description: 'Allows to query the database for self **Users** information.',
        type: UsersType,
        args: {
            userId: { type: GraphQLID }
        },
        async resolve(parent, args, context) {
            const locale = context.cookieLanguage
            const permission = await grantAccessGraphQL(context.user, {}, 'readAny', 'User')
            if (permission?.access) {
                const findUser = await UsersModel.findById(args.userId).populate({
                    path: 'roles',
                    model: 'Role',
                    populate: { path: 'organizationId', model: 'Organization' }
                })
                return findUser
            } else {
                throw new HttpException(
                    409,
                    __({ phrase: 'You do not have enough permission to perform this action', locale })
                )
            }
        }
    },
    userByOrganization: {
        description: 'Allows to query the database for self **Users** information.',
        type: new GraphQLList(UsersType),
        args: {
            organizationId: { type: GraphQLID }
        },
        async resolve(parent, { organizationId }, context) {
            const locale = context.cookieLanguage
            const permission = await grantAccessGraphQL(context.user, { organizationId }, 'readAny', 'User')
            if (permission?.access) {
                const findUser = usersService.findAllUserByOrg(organizationId)
                return findUser
            } else {
                throw new HttpException(
                    409,
                    __({ phrase: 'You do not have enough permission to perform this action', locale })
                )
            }
        }
    },
    userByIdByOrganization: {
        description: 'Allows to query the database for self **Users** information.',
        type: UsersType,
        args: {
            organizationId: { type: GraphQLID },
            userId: { type: GraphQLID }
        },
        async resolve(parent, { organizationId, userId }, context) {
            const locale = context.cookieLanguage
            const permission = await grantAccessGraphQL(context.user, { organizationId }, 'readAny', 'User')
            if (permission?.access) {
                const findUser = usersService.findUserByIdByOrg(userId, organizationId)
                return findUser
            } else {
                throw new HttpException(
                    409,
                    __({ phrase: 'You do not have enough permission to perform this action', locale })
                )
            }
        }
    }
}
