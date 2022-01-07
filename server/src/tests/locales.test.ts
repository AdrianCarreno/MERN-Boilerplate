import locales from '../locales'

describe('Locales', () => {
    describe(`are objects`, () => {
        for (const locale in locales) {
            it('should be of type "object"', () => {
                expect(typeof locales[locale]).toBe('object')
            })
        }
    })

    describe('should all have the same sentences', () => {
        for (const locale in locales) {
            it(`[${locale}] keys are present in all other locales`, () => {
                for (const otherLocale in locales) {
                    if (locale !== otherLocale) {
                        const keys = Object.keys(locales[locale])
                        const otherKeys = Object.keys(locales[otherLocale])
                        expect(keys.every(key => otherKeys.includes(key))).toBe(true)
                    }
                }
            })
        }
    })
})
