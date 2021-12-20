import { faEnvelope, faHouseUser, faUsers, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { Dropdown } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { LoginModal } from '../Auth'
import './Navbar.scss'

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-mainbg">
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
                        <NavLink className="nav-link" to="/">
                            <Icon icon={faHouseUser} /> Home
                        </NavLink>
                    </li>
                    <li className="nav-item active">
                        <NavLink className="nav-link" to="/about">
                            <Icon icon={faUsers} /> About us
                        </NavLink>
                    </li>
                    <li className="nav-item active">
                        <NavLink className="nav-link" to="/contact">
                            <Icon icon={faEnvelope} /> Contact us
                        </NavLink>
                    </li>
                    <li className="nav-item active">
                        <Dropdown className="btn-group">
                            <LoginModal />
                            <Dropdown.Toggle split variant="success" id="dropdown-split-basic" />
                            <Dropdown.Menu>
                                <Dropdown.Item href="/register">
                                    <Icon icon={faUserPlus} /> Register
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </li>
                </ul>
            </div>
        </nav>
    )
}
