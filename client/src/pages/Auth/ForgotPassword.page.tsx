import { ForgotPasswordComponent } from '../../components/Auth'
import { t } from 'i18next'

export default function ForgotPasswordPage() {
    return (
        <div className="container">
            <div className="margin-top-100 margin-bottom-50">
                <h1 className="text-center">{t('forgotPasswordPage:title')}</h1>
                <ForgotPasswordComponent />
            </div>
        </div>
    )
}
