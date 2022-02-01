import { t } from 'i18next'

export default function HomePage() {
    return (
        <div className="container">
            <h1 className="text-center" style={{ paddingTop: '30%' }}>
                {t('homePage:title')}
            </h1>
            <p>{t('homePage:description')}</p>
        </div>
    )
}
