import { Router } from 'express'
import AuthRouter from './auth.route'
import UsersRouter from './users.route'
import GraphqlRouter from './graphql.route'
import OrganizationsRouter from './organizations.route'
import RolesRouter from './roles.route'
/* import IndexController from '@controllers/index.controller' */

const router = Router()

router.use('/api', AuthRouter)
router.use('/api/users', UsersRouter)
router.use('/api/graphql', GraphqlRouter)
router.use('/api/organizations', OrganizationsRouter)
router.use('/api/roles', RolesRouter)
/* router.use('/api/pallets', PalletsRouter) */
/* router.get(`/`, IndexController.index) */

export default router
