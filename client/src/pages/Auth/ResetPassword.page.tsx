import { t } from 'i18next'
import { ResetPasswordComponent } from '../../components/Auth'

export default function ResetPasswordPage() {
    return (
        <div className="container">
            <div className="margin-top-100 margin-bottom-50">
                <h1 className="text-center">{t('resetPasswordPage:title')}</h1>
                <ResetPasswordComponent />
            </div>
        </div>
    )
}
