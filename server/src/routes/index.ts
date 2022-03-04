import { Router } from 'express'

import AuthRoutes from '@routes/auth.route'
import IndexRoutes from '@routes/index.route'
import OrgRoutes from '@routes/organizations.route'
import RolesRoutes from '@routes/roles.route'
import UserRoutes from '@routes/users.route'
import GraphQLRoutes from '@/routes/graphql.route'

const router = Router()

router.use('/', AuthRoutes)
router.use('/', IndexRoutes)
router.use('/graphql', GraphQLRoutes)
router.use('/api/organizations', OrgRoutes)
router.use('/api/roles', RolesRoutes)
router.use('/api/users', UserRoutes)

export default router
