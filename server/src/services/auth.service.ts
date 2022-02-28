import { env, keys } from '@configs/index'
import { CreateUserDto, LoginUserDto } from '@dtos/users.dto'
import { HttpException } from '@exceptions/HttpException'
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface'
import { User } from '@interfaces/users.interface'
import userModel from '@models/users.model'
import { asset, frontendAsset, isEmpty } from '@utils/util'
import { logger } from '@/utils/logger'
import { generateHTML } from '@/utils/html'
import bcrypt from 'bcrypt'
import { __ } from 'i18n'
import jwt from 'jsonwebtoken'
import { sendHTMLEmail } from './email.service'
import path from 'path'
import { ObjectId } from 'mongoose'
/**
 * Creates user account in the data base
 * @param  {CreateUserDto} userData User data to create account
 * @param  {string=env.locale} locale
 * @returns Object with user information
 */
const signup = async (
    userData: CreateUserDto,
    locale: string = env.locale
): Promise<{ cookie: string; createdUser: User }> => {
    if (isEmpty(userData)) throw new HttpException(400, __({ phrase: 'Credentials are required', locale }))

    const findUser: User = await userModel.findOne({ email: userData.email })
    if (findUser)
        throw new HttpException(
            409,
            __({ phrase: 'Email {{email}} already exists', locale }, { email: userData.email })
        )

    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const createUserData: User = await userModel.create({ ...userData, password: hashedPassword })
    const loginToken = createToken(createUserData)
    const cookie = createCookie(loginToken)

    const verificationToken = createToken(createUserData, 0)
    const args = {
        fullName: createUserData.fullName,
        email: createUserData.email,
        verifyLink: asset(`/verify?token=${verificationToken.token}`),
        platformURL: env.url,
        platformName: env.platformName
    }
    sendHTMLEmail(
        createUserData.email,
        __({ phrase: 'Verify your email', locale }),
        generateHTML(path.join(__dirname, `/../email.templates/verify.email.template/${locale}.html`), args),
        { attachments: [{ filename: 'logo.png', path: frontendAsset('images/logo.png'), cid: 'logo' }] }
    ).catch(err => logger.error(__({ phrase: err.message, locale })))

    return { cookie, createdUser: createUserData }
}
/**
 * Login into an existing account
 * @param  {LoginUserDto} userData User data to login
 * @param  {string=env.locale} locale
 * @returns cookie string with token, findUser obejct with user information, TokenData jwt signed
 */
const login = async (
    userData: LoginUserDto,
    locale: string = env.locale
): Promise<{ cookie: string; findUser: User; token: TokenData }> => {
    if (isEmpty(userData)) throw new HttpException(400, __({ phrase: 'Credentials are required', locale }))

    const findUser: User = await userModel.findOne({ email: userData.email })
    if (!findUser)
        throw new HttpException(409, __({ phrase: 'Email {{email}} not found', locale }, { email: userData.email }))

    const isPasswordMatching: boolean = await bcrypt.compare(userData.password, findUser.password)
    if (!isPasswordMatching) throw new HttpException(409, __({ phrase: 'Wrong password', locale }))

    const token = createToken(findUser, 3600)
    const cookie = createCookie(token)

    return { cookie, findUser, token }
}

const logout = async (userData: User, locale: string = env.locale): Promise<User> => {
    if (isEmpty(userData)) throw new HttpException(400, __({ phrase: 'Credentials are required', locale }))

    const findUser: User = await userModel.findOne({ email: userData.email, password: userData.password })
    if (!findUser)
        throw new HttpException(409, __({ phrase: 'Email {{email}} not found', locale }, { email: userData.email }))

    return findUser
}
/**
 * Saves the date the user verify the account via email
 * @param  {ObjectId} userId
 * @param  {string=env.locale} locale
 * @returns Object, with user information
 */
const verifyUserEmailService = async (userId: ObjectId, locale: string = env.locale): Promise<User> => {
    if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))

    let findUser = await userModel.findOne({ _id: userId })
    if (!findUser) throw new HttpException(409, __({ phrase: 'User not found', locale }))

    findUser.emailVerifiedAt = new Date()
    findUser = await findUser.save()
    if (!findUser) throw new HttpException(409, __({ phrase: 'Unable to update user', locale }))

    return findUser
}

/**
 * Initiates reset password process for a given email
 * @param {*} email Email for which to initiate the reset password process
 * @returns Object, data to generate email to send (reset token, fullname, email)
 */
const forgotPasswordService = async (email: string, locale: string = env.locale): Promise<User> => {
    const findUser: User = await userModel.findOneAndUpdate(
        { email },
        { updatedAt: new Date() },
        { new: true, timestamps: false }
    )
    if (isEmpty(findUser)) throw new HttpException(409, __({ phrase: 'Email {{email}} not found', locale }, { email }))
    const resetToken = createToken(findUser)
    const args = {
        fullName: findUser.fullName,
        resetLink: asset(`/reset-password?token=${resetToken.token}`)
    }
    await sendHTMLEmail(
        findUser.email,
        __({ phrase: 'Reset your password', locale }),
        generateHTML(path.join(__dirname, `/../email.templates/reset.password.template/${locale}.html`), args),
        { attachments: [{ filename: 'logo.png', path: frontendAsset('images/logo.png'), cid: 'logo' }] }
    ).catch(err => logger.error(__({ phrase: err.message, locale })))

    return findUser
}

/**
 * Resets password for a given token
 * @param {string} token Token to reset password
 * @param {string} password New password
 * @returns {User} data of the updated user
 */
const resetPasswordService = async (token: string, password: string, locale: string = env.locale): Promise<User> => {
    if (isEmpty(token)) throw new HttpException(400, __({ phrase: 'Token is required', locale }))
    if (isEmpty(password)) throw new HttpException(400, __({ phrase: 'Password is required', locale }))

    const tokenData: DataStoredInToken = verifyToken(token)
    if (!tokenData) throw new HttpException(409, __({ phrase: 'Invalid token', locale }))

    const hashedPassword = await bcrypt.hash(password, 10)

    const findUser: User = await userModel.findOneAndUpdate(
        { _id: tokenData._id },
        { password: hashedPassword },
        { new: true }
    )
    if (!findUser) throw new HttpException(409, __({ phrase: 'User not found', locale }))
    return findUser
}
/**
 * Returns a signed token with expiration date
 * @param  {User} user User information to save in the token
 * @param  {} expiresIn=3600 expiration of the token 3600 as default
 * @returns TokenData string with expiration date and jwt
 */
const createToken = (user: User, expiresIn = 3600): TokenData => {
    const dataStoredInToken: DataStoredInToken = { _id: user._id } // user._id, [organizationId, resources]
    const secretKey: string = keys.secretKey

    return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) }
}
/**
 * Verify the token with secret key
 * @param  {string} token token to verify
 * @param  {boolean} ignoreExpiration=false ignore expiration date false as default
 * @returns DataStoredInToken, information inside the token
 */
const verifyToken = (token: string, ignoreExpiration = false): DataStoredInToken => {
    const secretKey: string = keys.secretKey

    return jwt.verify(token, secretKey, { ignoreExpiration }) as DataStoredInToken
}
/**
 * Creates the string to use as a cookie
 * @param  {TokenData} tokenData signed token with user information
 * @returns String with information to use as a cookie
 */
const createCookie = (tokenData: TokenData): string => {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`
}

// export default AuthService
export default {
    signup,
    login,
    logout,
    verifyToken,
    resetPasswordService,
    forgotPasswordService,
    verifyUserEmailService,
    createCookie,
    createToken
}
