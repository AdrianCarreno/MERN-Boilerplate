import { faEnvelope, faHouseUser, faUsers, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { Dropdown } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { LoginModal } from '../Auth'
import './Navbar.scss'
import '../../global.scss'
import LanguageSelectorComponent from './LanguageSelector.component'
import { t } from 'i18next'

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-mainbg fixed-top padding-10">
            <NavLink className="navbar-brand navbar-logo" to="/">
                <img src="logo192.png" alt="logo" />
            </NavLink>

            <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <i className="fas fa-bars text-white"></i>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav ms-auto">
                    <li className="nav-item active">
                        <NavLink className="nav-link" to="/" data-toggle="collapse" data-target="#navbarSupportedContent">
                            <Icon icon={faHouseUser} /> {t('homePage:title')}
                        </NavLink>
                    </li>
                    <li className="nav-item active">
                        <NavLink className="nav-link" to={t('routes:about')} data-toggle="collapse" data-target="#navbarSupportedContent">
                            <Icon icon={faUsers} /> {t('aboutPage:title')}
                        </NavLink>
                    </li>
                    <li className="nav-item active">
                        <NavLink className="nav-link" to={t('routes:contact')} data-toggle="collapse" data-target="#navbarSupportedContent">
                            <Icon icon={faEnvelope} /> {t('contactPage:title')}
                        </NavLink>
                    </li>
                    <li>
                        <LanguageSelectorComponent />
                    </li>
                    <li className="nav-item active">
                        <Dropdown className="btn-group">
                            <LoginModal />
                            <Dropdown.Toggle split variant="success" id="dropdown-split-basic" />
                            <Dropdown.Menu>
                                <Dropdown.Item href={t('routes:register')}>
                                    <Icon icon={faUserPlus} /> {t('registerPage:title')}
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </li>
                </ul>
            </div>
        </nav>
    )
}
