import Schema from '@/schema/index'
import { locale } from '@configs/env'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const graphql = async (req, res, next) => {
    if (!req.user) {
        return res.status(401)
    }

    return {
        schema: Schema,
        graphiql: true,
        context: {
            user: req.user,
            cookieLanguage: req.cookies.language || locale
        }
    }
}

export default {
    graphql
}
