import { t } from 'i18next'
import '../../global.scss'

export default function ProfilePage() {
    return (
        <div className="container">
            <div className='margin-top-100 margin-bottom-50'>
                <h1 className="text-center">{t('profile:title')}</h1>
            </div>
        </div>
    )
}
