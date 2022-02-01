import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import { t } from 'i18next'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { Alert, Button, Form, InputGroup } from 'react-bootstrap'

interface IRegisterErrors {
    firstName?: string
    lastName?: string
    email?: string
    password?: string
    confirmPassword?: string
}

interface IRegisterInputs {
    firstName: string
    lastName?: string | undefined
    email: string
    password: string
    confirmPassword: string
}

export default function RegisterBox() {
    const [inputs, setInputs] = useState<IRegisterInputs>({
        firstName: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [passwordsMatch, setPasswordsMatch] = useState<boolean | undefined>(undefined)
    const [error, setError] = useState<IRegisterErrors>({})
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [registered, setRegistered] = useState<boolean>(false)
    const [remainingTime, setRemainingTime] = useState<number>(0)
    const [showPassword, setShowPassword] = useState<boolean>(false)

    useEffect(() => {
        setPasswordsMatch(inputs.password !== '' ? inputs.password === inputs.confirmPassword : undefined)
    }, [inputs.password, inputs.confirmPassword])

    useEffect(() => {
        if (passwordsMatch === true) setError({ ...error, confirmPassword: undefined })
        else if (passwordsMatch === false) setError({ ...error, confirmPassword: t('registerPage:passwordsDontMatch') })
    }, [passwordsMatch])

    useEffect(() => {
        if (remainingTime > 0) setTimeout(() => setRemainingTime(remainingTime - 1), 1000)
        else if (registered) window.location.href = '/'
    }, [remainingTime])

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        if (name === 'lastName') setInputs(values => ({ ...values, lastName: value !== '' ? value : undefined }))
        else setInputs(values => ({ ...values, [name]: value }))
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        setIsLoading(true)
        const { confirmPassword, ...values } = inputs
        event.preventDefault()
        axios
            .post('/api/auth/signup', values)
            .then(res => {
                if (res.status === 201) {
                    setRegistered(true)
                    setRemainingTime(5)
                }
            })
            .catch(err => {
                const error_ = err.response.data
                if (/firstName/i.test(error_.message)) setError({ ...error, firstName: error_.message })
                if (/lastName/i.test(error_.message)) setError({ ...error, lastName: error_.message })
                if (/email/i.test(error_.message)) setError({ ...error, email: error_.message })
                if (/password/i.test(error_.message)) setError({ ...error, password: error_.message })
            })
            .finally(() => setIsLoading(false))
    }
    if (registered) {
        return <Alert variant="success">{t('registerPage:success', { count: remainingTime })}</Alert>
    } else {
        return (
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicFirstName">
                    <Form.Label>{t('registerPage:firstName')}</Form.Label>
                    <Form.Control
                        required
                        name="firstName"
                        type="text"
                        placeholder="John"
                        minLength={2}
                        maxLength={20}
                        autoComplete="given-name"
                        isInvalid={error.firstName !== undefined}
                        onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">{error.firstName}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicLastName">
                    <Form.Label>{t('registerPage:lastName')}</Form.Label>
                    <Form.Control
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        minLength={2}
                        maxLength={20}
                        isInvalid={error.lastName !== undefined}
                        onChange={handleChange}
                    />
                    <Form.Control.Feedback />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>{t('registerPage:email')}</Form.Label>
                    <Form.Control
                        required
                        name="email"
                        type="email"
                        placeholder="john.doe@email.com"
                        autoComplete="username"
                        isInvalid={error.email !== undefined}
                        onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">{error.email}</Form.Control.Feedback>
                </Form.Group>

                <Form.Label>{t('registerPage:password')}</Form.Label>
                <InputGroup className="mb-3">
                    <Form.Control
                        required
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('registerPage:password')}
                        autoComplete="current-password"
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                        title={t('registerPage:passwordRequirements')}
                        isInvalid={error.password !== undefined}
                        onChange={handleChange}
                    />
                    <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <Icon icon={faEyeSlash} /> : <Icon icon={faEye} />}
                    </Button>
                </InputGroup>
                <Form.Control.Feedback type="invalid">{error.password}</Form.Control.Feedback>

                <Form.Group className="mb-3" controlId="formBasicPasswordConfirmation">
                    <Form.Label>{t('registerPage:confirmPassword')}</Form.Label>
                    <Form.Control
                        required
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('registerPage:reEnterPassword')}
                        autoComplete="new-password"
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                        title={t('registerPage:passwordRequirements')}
                        isInvalid={error.confirmPassword !== undefined}
                        onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">{error.confirmPassword}</Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" type="submit" disabled={!passwordsMatch || isLoading}>
                    {t(isLoading ? 'common:loading' : 'registerPage:submit')}
                </Button>
            </Form>
        )
    }
}
