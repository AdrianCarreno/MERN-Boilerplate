import { t } from 'i18next'
import { ContactForm } from '../../components'

export default function ContactPage() {
    return (
        <div className="container">
            <h1 className="text-center" style={{ paddingTop: '15vh' }}>
                {t('contactPage:title')}
            </h1>
            <ContactForm />
        </div>
    )
}
