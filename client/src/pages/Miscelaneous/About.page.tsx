import { t } from 'i18next'

export default function AboutPage() {
    return (
        <div className="container">
            <h1 className="text-center" style={{ paddingTop: '30%' }}>
                {t('aboutPage:title')}
            </h1>
            <p>{t('aboutPage:description')}</p>
        </div>
    )
}
