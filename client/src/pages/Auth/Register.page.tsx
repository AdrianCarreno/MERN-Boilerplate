import { RegisterBox } from '../../components/Auth'
import { t } from 'i18next'
import '../../global.scss'

export default function RegisterPage() {
    return (
        <div className="container">
            <div className='margin-top-100 margin-bottom-50'>
                <h1 className="text-center">{t('registerPage:title')}</h1>
                <RegisterBox />
            </div>
        </div>
    )
}
