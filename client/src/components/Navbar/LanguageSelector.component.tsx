import { Dropdown } from 'react-bootstrap'
import Flags from 'country-flag-icons/react/3x2'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Cookies from 'js-cookie'

export default function LanguageSelectorComponent() {
    const [language, setLanguage] = useState<string>('en')
    const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false)
    const { i18n } = useTranslation()

    const getFlag = (lang: string) => {
        switch (lang) {
            case 'en':
                return <Flags.GB style={{ height: '1em' }} />
            case 'es':
                return <Flags.ES style={{ height: '1em' }} />
        }
    }

    useEffect(() => {
        // Language from local storage is set by user, so it takes precedence over
        // the one from the one in cookies (returned by server)
        const languageFromLocalStorage = localStorage.getItem('i18nextLng')
        let lang: string
        if (typeof languageFromLocalStorage !== 'string') {
            localStorage.setItem('i18nextLng', 'en')
            lang = 'en'
        } else {
            lang = languageFromLocalStorage.split('-')[0]
        }

        const languageFromCookie = Cookies.get('language')
        if (typeof languageFromCookie !== 'string') {
            // There is no language in cookies, so we set it to 'lang'
            Cookies.set('Language', lang)
        } else {
            // The language in cookies is different from the one in local storage, so we set it to the one in local storage
            if (languageFromCookie.split('-')[0] !== lang) Cookies.set('language', lang)
        }
        setLanguage(lang)
    }, [])

    const handleSelect = async (eventKey: string | null) => {
        if (typeof eventKey === 'string') {
            setLanguage(eventKey)
            i18n.changeLanguage(eventKey)
            Cookies.set('language', eventKey)
            await i18n.reloadResources()
        }
        setShowLanguageDropdown(false)
        window.location.reload()
    }

    return (
        <Dropdown
            id="language-selector"
            show={showLanguageDropdown}
            onMouseEnter={() => setShowLanguageDropdown(true)}
            onSelect={handleSelect}
        >
            <Dropdown.Toggle variant="success">{getFlag(language)}</Dropdown.Toggle>
            <Dropdown.Menu onMouseLeave={() => setShowLanguageDropdown(false)}>
                <Dropdown.Item eventKey="en">{getFlag('en')} English</Dropdown.Item>
                <Dropdown.Item eventKey="es">{getFlag('es')} Español</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    )
}
