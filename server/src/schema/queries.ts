import { GraphQLObjectType } from 'graphql'
import Queries from './queries/index'

const RootQuery = new GraphQLObjectType({
    name: 'Queries',
    description: '',
    fields: {
        ...Queries.OrganizationsQueries,
        ...Queries.UsersQueries,
        ...Queries.RolesQueries
    }
})

export default RootQuery
