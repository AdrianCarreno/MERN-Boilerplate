import { env } from '@/configs'
import { Role } from '@/interfaces/roles.interface'
import organizationModel from '@/models/organizations.model'
import { CreateUserDto, UpdateUserDto } from '@dtos/users.dto'
import { HttpException } from '@exceptions/HttpException'
import { User } from '@interfaces/users.interface'
import userModel from '@models/users.model'
import { isEmpty } from '@utils/util'
import bcrypt from 'bcrypt'
import { __ } from 'i18n'
/**
 * Find all the user that has the organization
 * @param  {string} org Id of the organization
 * @param  {string=env.locale} locale
 * @returns Array of users
 */
const findAllUserByOrg = async (org: string, locale: string = env.locale): Promise<User[]> => {
    if (isEmpty(org)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))
    const orgFound = await organizationModel.findById(org)
    if (!orgFound) throw new HttpException(409, __({ phrase: 'Organization not found', locale }))
    const userInfo = 'firstName lastName roles email'

    const users: User[] = await userModel
        .find({}, userInfo)
        .populate({ path: 'roles', model: 'Role', match: { organizationId: { $eq: org } } })
    const usersFiltered: User[] = users.filter(user => user.roles.length > 0)

    return usersFiltered
}
/**
 * Find all the users in the data base
 * @returns Array of users
 */
const findAllUser = async (): Promise<User[]> => {
    const users: User[] = await userModel.find({}, '-password').populate('roles')

    return users
}
/**
 * Find one user
 * @param  {string} userId User id to search
 * @param  {string=env.locale} locale
 * @returns User information
 */
const findUserById = async (userId: string, locale: string = env.locale): Promise<User> => {
    if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))
    const findUser: User = await userModel.findOne({ _id: userId }, '-password').populate('roles')

    if (!findUser) throw new HttpException(404, __({ phrase: 'User not found', locale }))

    return findUser
}
/**
 * Find one user in one organization
 * @param  {string} userId User id to search
 * @param  {string=env.locale} locale
 * @param  {string} org Organization id to search in
 * @returns User information
 */
const findUserByIdByOrg = async (userId: string, locale: string = env.locale, org: string): Promise<User> => {
    if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))
    if (isEmpty(org)) throw new HttpException(400, __({ phrase: 'An Organization ID is required', locale }))

    const orgFound = await organizationModel.findById(org)
    if (!orgFound) throw new HttpException(409, __({ phrase: 'Organization not found', locale }))

    const userInfo = 'firstName lastName roles email'
    const findUser: User = await userModel
        .findOne({ _id: userId }, userInfo)
        .populate({ path: 'roles', model: 'Role', match: { organizationId: { $eq: org } } })

    if (!(findUser?.roles.length > 0)) throw new HttpException(404, __({ phrase: 'User not found', locale }))

    return findUser
}
/**
 * Creates a new User in the data base
 * @param  {CreateUserDto} userData user to create
 * @param  {string=env.locale} locale
 * @returns Object with information of the new user
 */
const createUser = async (userData: CreateUserDto, locale: string = env.locale): Promise<User> => {
    if (isEmpty(userData)) throw new HttpException(400, __({ phrase: 'Credentials are required', locale }))
    const findUser: User = await userModel.findOne({ email: userData.email }, '-password') // .select('-password')
    if (findUser)
        throw new HttpException(
            409,
            __({ phrase: 'Email {{email}} already exists', locale }, { email: userData.email })
        )

    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const createUserData: User = await userModel.create({ ...userData, password: hashedPassword })

    return createUserData
}
/**
 * Update information of a user
 * @param  {string} userId user to update
 * @param  {UpdateUserDto} userData information to update in user
 * @param  {string=env.locale} locale
 * @returns User with updated information
 */
const updateUser = async (userId: string, userData: UpdateUserDto, locale: string = env.locale): Promise<User> => {
    if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))
    if (isEmpty(userData)) throw new HttpException(400, __({ phrase: 'User data is required', locale }))

    if (userData.email) {
        const findUser: User = await userModel.findOne({ email: userData.email })
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

    const updateUserById: User = await userModel.findByIdAndUpdate(userId, { userData })
    if (!updateUserById) throw new HttpException(409, __({ phrase: 'User not found', locale }))

    return updateUserById
}
/**
 * Add one role to a user
 * @param  {string} userId user to add role
 * @param  {Role} findRole role to add
 * @param  {string=env.locale} locale
 * @returns User with updated information
 */
const addRoleToUser = async (userId: string, findRole: Role, locale: string = env.locale): Promise<User> => {
    if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))

    const UserFound = await userModel.findById(userId).populate('roles')
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

    const updateUserById = await userModel.findOneAndUpdate(
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
/**
 * Remove one role assigned to user
 * @param  {string} userId user id to remove role
 * @param  {Role} findRole role found to remove from user
 * @param  {string=env.locale} locale
 * @returns User with updated information
 */
const removeRoleToUser = async (userId: string, findRole: Role, locale: string = env.locale): Promise<User> => {
    if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))

    const updateUserById = await userModel.findOneAndUpdate(
        { _id: userId },
        { $pull: { roles: findRole._id } },
        { new: true }
    )
    if (!updateUserById) {
        throw new HttpException(409, __({ phrase: 'User not found', locale }))
    }
    return updateUserById
}
/**
 * Delete user in the data base via id
 * @param  {string} userId user id to delete
 * @param  {string=env.locale} locale
 * @returns object with the deleted user
 */
const deleteUser = async (userId: string, locale: string = env.locale): Promise<User> => {
    if (isEmpty(userId)) throw new HttpException(400, __({ phrase: 'An ID is required', locale }))
    const deleteUserById: User = await userModel.findByIdAndDelete(userId)
    if (!deleteUserById) throw new HttpException(404, __({ phrase: 'User not found', locale }))

    return deleteUserById
}

export default {
    findAllUserByOrg,
    findAllUser,
    findUserById,
    findUserByIdByOrg,
    createUser,
    updateUser,
    addRoleToUser,
    removeRoleToUser,
    deleteUser
}
