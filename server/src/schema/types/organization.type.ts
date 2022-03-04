import { GraphQLBoolean, GraphQLID, GraphQLObjectType, GraphQLInputObjectType, GraphQLString } from 'graphql'
import { GraphQLDateTime } from 'graphql-iso-date'

export const OrganizationsType = new GraphQLObjectType({
    name: 'Organizations',
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        enabled: { type: GraphQLBoolean },
        createdAt: { type: GraphQLDateTime },
        updatedAt: { type: GraphQLDateTime }
    })
})

export const OrganizationsInputType = new GraphQLInputObjectType({
    name: 'OrganizationsInput',
    fields: () => ({
        name: { type: GraphQLString },
        description: { type: GraphQLString }
    })
})
