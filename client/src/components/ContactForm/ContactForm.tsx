import '../../global.scss'
import { t } from 'i18next'

const ContactForm = () => {
    return (
        <div className='with-total padding-20'>
            <div className='row'>
                <div className='col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 margin-top-20 margin-bottom-20 padding-top-40'>
                    <p>{t('contactPage:call')}</p>
                    <p>{t('contactPage:email')}</p>
                    <p>{t('contactPage:address')}</p>
                </div>
                <div className='col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 margin-top-20 margin-bottom-20'>
                    <form>
                        <div className="form-group">
                            <select className="form-control margin-top-20" id="exampleFormControlSelect1" >
                                <option>{t('contactPage:form-category-selection')}</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <input type="text" className="form-control margin-top-20" id="name" placeholder={t('contactPage:form-name')} aria-describedby="emailHelp" />
                        </div>
                        <div className="form-group">
                            <input type="email" className="form-control margin-top-20" id="email" placeholder={t('contactPage:form-email')} aria-describedby="emailHelp" />
                            <small id="emailHelp" className="form-text text-muted">{t('contactPage:form-info')}</small>
                        </div>
                        <div className="mb-3">
                            <textarea className="form-control margin-top-20" id="validationTextarea" rows={9} placeholder={t('contactPage:form-content')}></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary">{t('contactPage:form-button')}</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ContactForm
