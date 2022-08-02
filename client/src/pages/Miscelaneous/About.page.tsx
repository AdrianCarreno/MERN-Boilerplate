import { t } from 'i18next'
import { AboutContainer } from '../../components'

export default function AboutPage() {
    return (
        <div className="container">
            <h1 className="text-center" style={{ paddingTop: '15vh' }}>
                {t('aboutPage:title-view')}
            </h1>
            <br />
            <AboutContainer />
        </div>
    )
}
