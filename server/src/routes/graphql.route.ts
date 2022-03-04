/* Express */
import { Router } from 'express'

/* MiddleWare */
import authMiddleware from '@middlewares/auth.middleware'
import validationMiddleware from '@middlewares/validation.middleware'
import { grantAccess, superAdminAccess } from '@/middlewares/permission.middleware'

import { graphqlHTTP } from 'express-graphql'
import GraphqlController from '@/controllers/graphql.controller'

const router = Router()

router.post('', authMiddleware(), graphqlHTTP(GraphqlController.graphql))

export default router
