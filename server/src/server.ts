import 'dotenv/config'
import RolesRoute from './routes/roles.route'
import OrganizationsRoute from './routes/organizations.route'
import App from '@/app'
import AuthRoute from '@routes/auth.route'
import IndexRoute from '@routes/index.route'
import UsersRoute from '@routes/users.route'
import AccessControlServices from '@services/accessControl.service'

const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute(), new RolesRoute(), new OrganizationsRoute()])

const startServer = async () => {
    await AccessControlServices.createSuperAdmin()
    await AccessControlServices.initAccessControl()
    app.listen()
}

startServer()
