import { useLocation } from 'react-router-dom'
import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import axios from 'axios'
import { t } from 'i18next'

export default function ResetPasswordComponent() {
    const search = useLocation().search
    const token: string | null = new URLSearchParams(search).get('token')
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [passwordError, setPasswordError] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [passwordsMatch, setPasswordsMatch] = useState<boolean | undefined>(undefined)
    const [changed, setChanged] = useState<boolean>(false)

    useEffect(() => {
        setPasswordsMatch(password !== '' ? password === confirmPassword : undefined)
    }, [password, confirmPassword])

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        if (name === 'password') setPassword(value)
        if (name === 'confirmPassword') setConfirmPassword(value)
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        setIsLoading(true)
        event.preventDefault()
        axios
            .post('/api/auth/reset-password', { token, password })
            .then(res => {
                if (res.status === 200) setChanged(true)
            })
            .catch(err => {
                const error_ = err.response.data
                if (/password/i.test(error_.message)) setPasswordError(error_.message)
            })
            .finally(() => setIsLoading(false))
    }

    if (changed) {
        return <Alert variant="success">{t('resetPasswordPage:success')}</Alert>
    } else {
        return (
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>{t('resetPasswordPage:password')}</Form.Label>
                    <Form.Control
                        required
                        name="password"
                        type="password"
                        placeholder={t('resetPasswordPage:password')}
                        autoComplete="current-password"
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                        title={t('resetPasswordPage:passwordPattern')}
                        isInvalid={passwordError !== undefined}
                        onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">{passwordError}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPasswordConfirmation">
                    <Form.Label>{t('resetPasswordPage:confirmPassword')}</Form.Label>
                    <Form.Control
                        required
                        name="confirmPassword"
                        type="password"
                        placeholder={t('resetPasswordPage:confirmPassword')}
                        autoComplete="new-password"
                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                        title={t('resetPasswordPage:passwordPattern')}
                        isInvalid={passwordError !== undefined}
                        onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">{passwordError}</Form.Control.Feedback>
                </Form.Group>
                <Button variant="primary" type="submit" disabled={!passwordsMatch || isLoading}>
                    {isLoading ? t('common:loading') : t('common:submit')}
                </Button>
            </Form>
        )
    }
}
