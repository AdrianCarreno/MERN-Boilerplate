import {
    GraphQLBoolean,
    GraphQLID,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInputObjectType,
    GraphQLNonNull
} from 'graphql'
import { GraphQLDateTime } from 'graphql-iso-date'
import { RolesType } from '@/schema/types/role.type'

export const UsersType = new GraphQLObjectType({
    name: 'Users',
    fields: () => ({
        _id: { type: GraphQLID },
        email: { type: GraphQLString },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        fullName: { type: GraphQLString },
        roles: { type: new GraphQLList(RolesType) },
        emailVerifiedAt: { type: GraphQLDateTime },
        enabled: { type: GraphQLBoolean },
        createdAt: { type: GraphQLDateTime },
        updatedAt: { type: GraphQLDateTime }
    })
})

export const UserCreationInputType = new GraphQLInputObjectType({
    name: 'UserCreationInput',
    fields: () => ({
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        roles: { type: new GraphQLList(GraphQLID) }
    })
})

export const UserUpdateInputType = new GraphQLInputObjectType({
    name: 'UserUpdateInput',
    fields: () => ({
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString }
    })
})
