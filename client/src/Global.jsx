const TOKEN_KEY = 'user'

export const loginSet = e => {
    localStorage.setItem(TOKEN_KEY, e)
}

export const isLogin = () => {
    const user = localStorage.getItem('user')
    if (user && Object.keys(user).length !== 0) {
        return true
    }
    return false
}

export const getUser = () => {
    const user =
        JSON.parse(localStorage.getItem(TOKEN_KEY)) !== null
            ? JSON.parse(localStorage.getItem(TOKEN_KEY))
            : { fullName: 'nombre' }
    return user
}

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
}
