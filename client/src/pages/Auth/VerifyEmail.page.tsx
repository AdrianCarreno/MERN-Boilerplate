import { VerifyEmailComponent } from '../../components/Auth'
import { t } from 'i18next'

export default function VerifyEmailPage() {
    return (
        <div className="container">
            <div className="margin-top-100 margin-bottom-50">
                <h1 className="text-center">{t('verifyEmailPage:title')}</h1>
                <VerifyEmailComponent />
            </div>
        </div>
    )
}
