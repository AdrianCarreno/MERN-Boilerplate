import { env } from '@/configs'
import { CreateUserDto } from '@dtos/users.dto'
import { HttpException } from '@exceptions/HttpException'
import { User } from '@interfaces/users.interface'
import userModel from '@models/users.model'
import { isEmpty } from '@utils/util'
import bcrypt from 'bcrypt'
import { __ } from 'i18n'

class UserService {
    public users = userModel

    public async findAllUser(): Promise<User[]> {
        const users: User[] = await this.users.find()
        return users
    }

    public async findUserById(userId: string, locale: string = env.locale): Promise<User> {
        if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))

        const findUser: User = await this.users.findOne({ _id: userId })
        if (!findUser) throw new HttpException(409, __({ phrase: 'User not found', locale }))

        return findUser
    }

    public async createUser(userData: CreateUserDto, locale: string = env.locale): Promise<User> {
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

    public async updateUser(userId: string, userData: CreateUserDto, locale: string = env.locale): Promise<User> {
        if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))
        if (isEmpty(userData)) throw new HttpException(400, __({ phrase: 'User data is required', locale }))

        if (userData.email) {
            const findUser: User = await this.users.findOne({ email: userData.email })
            if (findUser && findUser._id != userId)
                throw new HttpException(
                    409,
                    __({ phrase: 'Email {{email}} already exists', locale }, { email: userData.email })
                )
        }

        if (userData.password) {
            const hashedPassword = await bcrypt.hash(userData.password, 10)
            userData = { ...userData, password: hashedPassword }
        }

        const updateUserById: User = await this.users.findByIdAndUpdate(userId, { userData })
        if (!updateUserById) throw new HttpException(409, __({ phrase: 'User not found', locale }))

        return updateUserById
    }

    public async deleteUser(userId: string, locale: string = env.locale): Promise<User> {
        if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))
        const deleteUserById: User = await this.users.findByIdAndDelete(userId)
        if (!deleteUserById) throw new HttpException(409, __({ phrase: 'User not found', locale }))

        return deleteUserById
    }
}

export default UserService
