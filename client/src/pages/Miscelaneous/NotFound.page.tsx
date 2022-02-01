import { t } from 'i18next'

export default function NotFoundPage() {
    return (
        <div className="container">
            <h1 className="text-center" style={{ paddingTop: '30%' }}>
                {t('notFound:title')}
            </h1>
            <p>{t('notFound:description')}</p>
        </div>
    )
}
