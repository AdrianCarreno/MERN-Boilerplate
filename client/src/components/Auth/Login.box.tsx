import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import { ChangeEvent, FormEvent, useState } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { loginSet } from '../../Global'
import './Auth.scss'
import { t } from 'i18next'

export default function LoginBox() {
    const [inputs, setInputs] = useState({})
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setInputs(values => ({ ...values, [name]: value }))
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        axios
            .post('/api/auth/login', inputs)
            .then(res => {
                loginSet(JSON.stringify(res.data.data))
            })
            .catch(err => {
                console.log(err)
                setError(true)
            })
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>{t('loginPage:email')}</Form.Label>
                <Form.Control
                    name="email"
                    type="email"
                    placeholder={t('loginPage:email')}
                    autoComplete="username"
                    isInvalid={error}
                    onChange={handleChange}
                />
                <Form.Control.Feedback type="invalid">{t('loginPage:wrongCredentials')}</Form.Control.Feedback>
            </Form.Group>

            <Form.Label>{t('loginPage:password')}</Form.Label>
            <InputGroup className="mb-3">
                <Form.Control
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('loginPage:password')}
                    autoComplete="current-password"
                    onChange={handleChange}
                />
                <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Icon icon={faEyeSlash} /> : <Icon icon={faEye} />}
                </Button>
            </InputGroup>

            <Button variant="primary" type="submit">
                {t('loginPage:submit')}
            </Button>
            <p className="forgot-password text-right">
                <a href="/forgot-password">{t('loginPage:forgotPassword')}</a>
            </p>
        </Form>
    )
}
