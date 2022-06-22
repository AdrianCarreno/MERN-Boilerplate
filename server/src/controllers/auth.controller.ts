import AuthService from '@/services/auth.service'
import { locale } from '@configs/env'
import { CreateUserDto, LoginUserDto } from '@dtos/users.dto'
import { RequestWithUser } from '@interfaces/auth.interface'
import { User } from '@interfaces/users.interface'
import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongoose'
/**
 * Creates a new account user
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const signUp = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    try {
        const userData: CreateUserDto = req.body
        const userLocale = req.cookies.language || locale
        const { cookie, createdUser } = await AuthService.signup(userData, userLocale)

        res.setHeader('Set-Cookie', [cookie])
        res.status(201).json({ data: createdUser, message: 'signup' })
    } catch (error) {
        next(error)
    }
}

/**
 * Log in into an existing account (user)
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: LoginUserDto = req.body
        const userLocale = req.cookies.language || locale
        const { cookie, findUser, token } = await AuthService.login(userData, userLocale)

        res.setHeader('Set-Cookie', [cookie])
        res.status(200).json({ data: findUser, token: token.token, message: 'login' })
    } catch (error) {
        next(error)
    }
}

/**
 * Log out of an already logged in account, set authorization equals to null
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const userData: User = req.user
        const userLocale = req.cookies.language || locale
        const logOutUserData: User = await AuthService.logout(userData, userLocale)

        res.setHeader('Set-Cookie', ['Authorization=; Max-age=0'])
        res.status(200).json({ data: logOutUserData, message: 'logout' })
    } catch (error) {
        next(error)
    }
}

/**
 * Saves the date the user verify the account via email
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const verifyUserEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token: string = req.body?.token.toString()
        const userId: ObjectId = AuthService.verifyToken(token, true)._id
        const userLocale: string = req.cookies.language || locale
        const verifyUserData: User = await AuthService.verifyUserEmailService(userId, userLocale)

        res.status(200).json({ data: verifyUserData, message: 'verified' })
    } catch (error) {
        next(error)
    }
}

/**
 * Initiates reset password process for a given email
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email: string = req.body?.email?.toString()
        const userLocale: string = req.cookies.language || locale
        const resetUserPassword: User = await AuthService.forgotPasswordService(email, userLocale)

        res.status(200).json({ data: resetUserPassword, message: 'email sent' })
    } catch (error) {
        next(error)
    }
}

/**
 * Resets password for a given token (user)
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token: string = req.body?.token.toString()
        const password: string = req.body?.password?.toString()
        const userLocale: string = req.cookies.language || locale
        const resetUserPassword: User = await AuthService.resetPasswordService(token, password, userLocale)

        res.status(200).json({ data: resetUserPassword, message: 'password reset' })
    } catch (error) {
        next(error)
    }
}

export default { signUp, logIn, logOut, verifyUserEmail, forgotPassword, resetPassword }
