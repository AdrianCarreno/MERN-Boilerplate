import { env } from '@/configs'
import { Role } from '@/interfaces/roles.interface'
import organizationModel from '@/models/organizations.model'
import { CreateUserDto } from '@dtos/users.dto'
import { HttpException } from '@exceptions/HttpException'
import { User } from '@interfaces/users.interface'
import userModel from '@models/users.model'
import { isEmpty } from '@utils/util'
import bcrypt from 'bcrypt'
import { __ } from 'i18n'

class UserService {
    public users = userModel

    public async findAllUserByOrg(org: string, locale: string = env.locale): Promise<User[]> {
        if (isEmpty(org)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))
        const orgFound = await organizationModel.findById(org)
        if (!orgFound) throw new HttpException(409, __({ phrase: 'Organization not found', locale }))
        const userInfo = 'firstName lastName roles email'

        const users: User[] = await this.users
            .find({}, userInfo)
            .populate({ path: 'roles', model: 'Role', match: { organizationId: { $eq: org } } })
        const usersFiltered: User[] = users.filter(user => user.roles.length > 0)

        return usersFiltered
    }

    public async findAllUser(): Promise<User[]> {
        const users: User[] = await this.users.find({}, '-password').populate('roles')

        return users
    }

    public async findUserById(userId: string, locale: string = env.locale): Promise<User> {
        if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))
        const findUser: User = await this.users.findOne({ _id: userId }, '-password').populate('roles')

        if (!findUser) throw new HttpException(404, __({ phrase: 'User not found', locale }))

        return findUser
    }

    public async findUserByIdByOrg(userId: string, locale: string = env.locale, org: string): Promise<User> {
        if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))
        if (isEmpty(org)) throw new HttpException(400, __({ phrase: 'An Organization ID is required', locale }))

        const orgFound = await organizationModel.findById(org)
        if (!orgFound) throw new HttpException(409, __({ phrase: 'Organization not found', locale }))

        const userInfo = 'firstName lastName roles email'
        const findUser: User = await this.users
            .findOne({ _id: userId }, userInfo)
            .populate({ path: 'roles', model: 'Role', match: { organizationId: { $eq: org } } })

        if (!(findUser?.roles.length > 0)) throw new HttpException(404, __({ phrase: 'User not found', locale }))

        return findUser
    }

    public async createUser(userData: CreateUserDto, locale: string = env.locale): Promise<User> {
        if (isEmpty(userData)) throw new HttpException(400, __({ phrase: 'Credentials are required', locale }))
        const findUser: User = await this.users.findOne({ email: userData.email }, '-password') // .select('-password')
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
            if (findUser && findUser._id.toString() !== userId)
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

    public async addRoleToUser(userId: string, findRole: Role, locale: string = env.locale): Promise<User> {
        if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))

        const UserFound = await this.users.findById(userId).populate('roles')
        if (!UserFound) throw new HttpException(404, __({ phrase: 'User not found', locale }))

        if (!findRole.organizationId) {
            const userWithGlobalRole = UserFound.roles.find(role => {
                return !role.organizationId
            })

            if (userWithGlobalRole)
                throw new HttpException(
                    409,
                    __(
                        { phrase: 'The user {{user}} already has a global role', locale },
                        { user: UserFound.fullName, role: findRole.name }
                    )
                )
        }

        const updateUserById = await this.users.findOneAndUpdate(
            { _id: userId, roles: { $ne: findRole } },
            { $push: { roles: findRole } },
            { new: true }
        )

        if (!updateUserById)
            throw new HttpException(
                409,
                __(
                    { phrase: 'The user {{user}} already has the role {{role}}', locale },
                    { user: UserFound.fullName, role: findRole.name }
                )
            )

        return updateUserById
    }

    public async removeRoleToUser(userId: string, findRole: Role, locale: string = env.locale): Promise<User> {
        if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))

        const updateUserById = await this.users.findOneAndUpdate(
            { _id: userId },
            { $pull: { roles: findRole._id } },
            { new: true }
        )
        if (!updateUserById) {
            throw new HttpException(409, __({ phrase: 'User not found', locale }))
        }
        return updateUserById
    }

    public async deleteUser(userId: string, locale: string = env.locale): Promise<User> {
        if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))
        const deleteUserById: User = await this.users.findByIdAndDelete(userId)
        if (!deleteUserById) throw new HttpException(404, __({ phrase: 'User not found', locale }))

        return deleteUserById
    }
}

export default UserService
