import { useState } from 'react'
import axios from 'axios'
import { Button, Form } from 'react-bootstrap'

interface RegisterValues {
    firstName: string
    lastName?: string
    email: string
    password: string
}

export default function RegisterBox() {
    const [inputs, setInputs] = useState<RegisterValues>({})

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.name
        const value = event.target.value
        setInputs((values: RegisterValues) => {
            if (value === '') delete values[name]
            else return { ...values, [name]: value }
        })
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        axios.post('/signup', inputs).then(res => {
            console.log(res)
        })
    }
    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicFirstName">
                <Form.Label>First name</Form.Label>
                <Form.Control
                    required
                    name="firstName"
                    type="text"
                    placeholder="John"
                    autoComplete="given-name"
                    onChange={handleChange}
                />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicLastName">
                <Form.Label>Last name</Form.Label>
                <Form.Control
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    autoComplete="family-name"
                    onChange={handleChange}
                />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                    required
                    name="email"
                    type="email"
                    placeholder="john.doe@email.com"
                    autoComplete="username"
                    onChange={handleChange}
                />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    required
                    name="password"
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    onChange={handleChange}
                />
            </Form.Group>
            <Button variant="primary" type="submit">
                Submit
            </Button>
        </Form>
    )
}
