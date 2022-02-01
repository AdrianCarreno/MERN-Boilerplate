import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Navbar } from './components'
import { Auth, Miscelaneous } from './pages'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resources from './locales'

export default function App() {
    i18next
        .use(initReactI18next)
        .use(LanguageDetector)
        .init({
            resources,
            fallbackLng: 'en',
            debug: true,
            ns: [],
            defaultNS: 'common',
            keySeparator: false,
            interpolation: {
                escapeValue: false,
                formatSeparator: ','
            }
        })

    return (
        <BrowserRouter>
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<Miscelaneous.HomePage />} />
                    {Object.entries(resources).map(([key, value]) => (
                        <Route key={key} path={value.routes.about} element={<Miscelaneous.AboutPage />} />
                    ))}
                    {Object.entries(resources).map(([key, value]) => (
                        <Route key={key} path={value.routes.contact} element={<Miscelaneous.ContactPage />} />
                    ))}
                    {Object.entries(resources).map(([key, value]) => (
                        <Route key={key} path={value.routes.login} element={<Auth.LoginPage />} />
                    ))}
                    {Object.entries(resources).map(([key, value]) => (
                        <Route key={key} path={value.routes.register} element={<Auth.RegisterPage />} />
                    ))}
                    {Object.entries(resources).map(([key, value]) => (
                        <Route key={key} path={value.routes['forgot-password']} element={<Auth.ForgotPasswordPage />} />
                    ))}
                    {Object.entries(resources).map(([key, value]) => (
                        <Route key={key} path={value.routes['reset-password']} element={<Auth.ResetPasswordPage />} />
                    ))}
                    {Object.entries(resources).map(([key, value]) => (
                        <Route key={key} path={value.routes.verify} element={<Auth.VerifyEmailPage />} />
                    ))}
                    <Route path="*" element={<Miscelaneous.NotFoundPage />} />
                </Routes>
            </main>
        </BrowserRouter>
    )
}
