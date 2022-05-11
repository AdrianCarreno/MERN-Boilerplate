import '../../global.scss'
import { t } from 'i18next'

const Footer = () => {
    return (
        <div className="footer">
            <div className='container'>
                <div className='row'>
                    <div className='col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-4'>
                        <dl className="list-footer">
                            <dt>
                                <a href="/">{t('homePage:title')}</a>
                            </dt>
                            <dt>
                                <a href={t('routes:register')}>{t('registerPage:title')}</a>
                            </dt>
                            <dt>
                                <a href={t('routes:about')}>{t('aboutPage:title')}</a>
                            </dt>
                            <dt>
                                <a href={t('routes:contact')}>{t('contactPage:title')}</a>
                            </dt>
                        </dl>
                    </div>
                    <div className='col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-4'>

                    </div>
                    <div className='col-xs-12 col-sm-12 col-md-12 col-lg-4 col-xl-4'>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer
