import { GraphQLObjectType } from 'graphql'
import Mutations from './mutations/index'

const RootMutation = new GraphQLObjectType({
    name: 'Mutations',
    description: '',
    fields: {
        ...Mutations.OrganizationsMutations,
        ...Mutations.RolesMutations,
        ...Mutations.UsersMutations
    }
})

export default RootMutation
