import { t } from 'i18next'

export default function ContactPage() {
    return (
        <div className="container">
            <h1 className="text-center" style={{ paddingTop: '30%' }}>
                {t('contactPage:title')}
            </h1>
            <p>{t('contactPage:description')}</p>
        </div>
    )
}
