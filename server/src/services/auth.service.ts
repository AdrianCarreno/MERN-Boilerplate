import { env, keys } from '@configs/index'
import { CreateUserDto } from '@dtos/users.dto'
import { HttpException } from '@exceptions/HttpException'
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface'
import { User } from '@interfaces/users.interface'
import userModel from '@models/users.model'
import { isEmpty } from '@utils/util'
import bcrypt from 'bcrypt'
import { __ } from 'i18n'
import jwt from 'jsonwebtoken'

class AuthService {
    public users = userModel

    public async signup(userData: CreateUserDto, locale: string = env.locale): Promise<User> {
        if (isEmpty(userData)) throw new HttpException(400, __({ phrase: 'Credentials are required', locale }))

        const findUser: User = await this.users.findOne({ email: userData.email })
        if (findUser)
            throw new HttpException(
                409,
                __({ phrase: 'Email {{email}} already exists', locale }, { email: userData.email })
            )

        const hashedPassword = await bcrypt.hash(userData.password, 10)
        const createUserData: User = await this.users.create({ ...userData, password: hashedPassword })

        return createUserData
    }

    public async login(
        userData: CreateUserDto,
        locale: string = env.locale
    ): Promise<{ cookie: string; findUser: User }> {
        if (isEmpty(userData)) throw new HttpException(400, __({ phrase: 'Credentials are required', locale }))

        const findUser: User = await this.users.findOne({ email: userData.email })
        if (!findUser)
            throw new HttpException(409, __({ phrase: 'Email {{email}} not found', locale }, { email: userData.email }))

        const isPasswordMatching: boolean = await bcrypt.compare(userData.password, findUser.password)
        if (!isPasswordMatching) throw new HttpException(409, __({ phrase: 'Wrong password', locale }))

        const tokenData = this.createToken(findUser)
        const cookie = this.createCookie(tokenData)

        return { cookie, findUser }
    }

    public async logout(userData: User, locale: string = env.locale): Promise<User> {
        if (isEmpty(userData)) throw new HttpException(400, __({ phrase: 'Credentials are required', locale }))

        const findUser: User = await this.users.findOne({ email: userData.email, password: userData.password })
        if (!findUser)
            throw new HttpException(409, __({ phrase: 'Email {{email}} not found', locale }, { email: userData.email }))

        return findUser
    }

    public createToken(user: User): TokenData {
        const dataStoredInToken: DataStoredInToken = { _id: user._id }
        const secretKey: string = keys.secretKey
        const expiresIn: number = 60 * 60

        return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) }
    }

    public createCookie(tokenData: TokenData): string {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`
    }
}

export default AuthService
