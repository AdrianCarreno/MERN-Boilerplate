import { LoginBox } from '../../components/Auth'
import { t } from 'i18next'

export default function LoginPage() {
    return (
        <div className="container">
            <div className="margin-top-100 margin-bottom-50">
                <h1 className="text-center">{t('loginPage:title')}</h1>
                <LoginBox />
            </div>
        </div>
    )
}
