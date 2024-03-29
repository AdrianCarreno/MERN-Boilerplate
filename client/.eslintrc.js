module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: ['plugin:react/recommended', 'standard'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 12,
        sourceType: 'module'
    },
    plugins: ['react', '@typescript-eslint'],
    rules: {
        'react/prop-types': 0,
        indent: ['error', 4, { SwitchCase: 1 }],
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
        'space-before-function-paren': 'off'
    }
}
