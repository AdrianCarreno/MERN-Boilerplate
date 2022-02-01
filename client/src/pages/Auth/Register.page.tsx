import { RegisterBox } from '../../components/Auth'
import { t } from 'i18next'

export default function RegisterPage() {
    return (
        <div className="container">
            <h1 className="text-center">{t('registerPage:title')}</h1>
            <RegisterBox />
        </div>
    )
}
