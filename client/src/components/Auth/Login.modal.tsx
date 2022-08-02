import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { LoginBox } from './index'
import { t } from 'i18next'

export default function LoginModal() {
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)

    return (
        <>
            <Button variant="success" size="sm" onClick={handleShow}>
                <Icon icon={faSignInAlt} /> {t('loginPage:title')}
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('loginPage:title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <LoginBox />
                </Modal.Body>
            </Modal>
        </>
    )
}
