import 'dotenv/config'
import App from '@/app'
import routes from '@routes/index'
import AccessControlServices from '@services/accessControl.service'

const app = new App(routes)

const startServer = async () => {
    await AccessControlServices.createSuperAdmin()
    await AccessControlServices.initAccessControl()
    app.listen()
}

startServer()
