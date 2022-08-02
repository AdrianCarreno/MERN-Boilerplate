import { GraphQLSchema } from 'graphql'

import Queries from './queries'
import Mutations from './mutations'

const Schema = new GraphQLSchema({
    query: Queries,
    mutation: Mutations
})

export default Schema
