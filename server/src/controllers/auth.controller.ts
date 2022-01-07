import { locale } from '@configs/env'
import { CreateUserDto } from '@dtos/users.dto'
import { RequestWithUser } from '@interfaces/auth.interface'
import { User } from '@interfaces/users.interface'
import AuthService from '@services/auth.service'
import { NextFunction, Request, Response } from 'express'

class AuthController {
    public authService = new AuthService()

    public signUp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: CreateUserDto = req.body
            const userLocale = req.cookies.Language || locale
            const signUpUserData: User = await this.authService.signup(userData, userLocale)
            const { cookie, findUser } = await this.authService.login(userData, userLocale)

            res.setHeader('Set-Cookie', [cookie])
            res.status(201).json({ data: signUpUserData, message: 'signup' })
        } catch (error) {
            next(error)
        }
    }

    public logIn = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: CreateUserDto = req.body
            const userLocale = req.cookies.Language || locale
            const { cookie, findUser } = await this.authService.login(userData, userLocale)

            res.setHeader('Set-Cookie', [cookie])
            res.status(200).json({ data: findUser, message: 'login' })
        } catch (error) {
            next(error)
        }
    }

    public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const userData: User = req.user
            const userLocale = req.cookies.Language || locale
            const logOutUserData: User = await this.authService.logout(userData, userLocale)

            res.setHeader('Set-Cookie', ['Authorization=; Max-age=0'])
            res.status(200).json({ data: logOutUserData, message: 'logout' })
        } catch (error) {
            next(error)
        }
    }
}

export default AuthController
