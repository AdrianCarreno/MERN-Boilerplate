import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { LoginBox } from './index'

export default function LoginModal() {
    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false)
    const handleShow = () => setShow(true)

    return (
        <>
            <Button variant="success" size="sm" onClick={handleShow}>
                <Icon icon={faSignInAlt} /> Login
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Login</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <LoginBox />
                </Modal.Body>
            </Modal>
        </>
    )
}
