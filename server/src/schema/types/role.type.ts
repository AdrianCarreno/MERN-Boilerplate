import {
    GraphQLID,
    GraphQLInputObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString
} from 'graphql'
import { GraphQLJSONObject } from 'graphql-type-json'
import { GraphQLDateTime } from 'graphql-iso-date'

export const RolesType = new GraphQLObjectType({
    name: 'Roles',
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        organizationId: { type: GraphQLID },
        resources: { type: GraphQLJSONObject },
        createdAt: { type: GraphQLDateTime },
        updatedAt: { type: GraphQLDateTime }
    })
})

export const rolesInputType = new GraphQLInputObjectType({
    name: 'rolesInput',
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: new GraphQLNonNull(GraphQLString) },
        resources: { type: new GraphQLList(ResourceAccessInputType) },
        description: { type: GraphQLString }
    })
})

export const ResourceAccessInputType = new GraphQLInputObjectType({
    name: 'ResourceAccessInput',
    description: `
        resourceName corresponds to the name of the mongoose collection,
        resourceAction corresponds to the accesscontrol type of CRUD possession (e.g. create:any or create:own),
        resourceAttributes corresponds to the accessible attributes of the resource, default is all attributes (['*'])
    `,
    fields: () => ({
        resourceName: { type: new GraphQLNonNull(GraphQLString) },
        resourceAction: { type: new GraphQLNonNull(GraphQLString) },
        resourceAttributes: { type: new GraphQLList(GraphQLString), defaultValue: ['*'] }
    })
})
