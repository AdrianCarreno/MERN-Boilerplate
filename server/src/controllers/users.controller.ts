import { locale } from '@configs/env'
import { addRoleDto, CreateUserDto, UpdateUserDto } from '@dtos/users.dto'
import { User } from '@interfaces/users.interface'
import UserService from '@services/users.service'
import { NextFunction, Request, Response } from 'express'
import { RequestWithUser } from '@interfaces/auth.interface'
import { Role } from '@/interfaces/roles.interface'
import { __ } from 'i18n'
import roleModel from '@/models/roles.model'
import { HttpException } from '@/exceptions/HttpException'

/**
 * Get the users assigned to an organization
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const getUsersByOrganization = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const userLocale = req.cookies.language || locale
        const findAllUsersData: User[] = await UserService.findAllUserByOrg(req.params.organizationId, userLocale)
        res.status(200).json({ data: findAllUsersData, message: 'findAll' })
    } catch (error) {
        next(error)
    }
}

/**
 * Get all the existing users in the database
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const getUsers = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const findAllUsersData: User[] = await UserService.findAllUser()
        res.status(200).json({ data: findAllUsersData, message: 'findAll' })
    } catch (error) {
        next(error)
    }
}

/**
 * Get one user, searched by id
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId: string = req.params.id
        const userLocale = req.cookies.language || locale
        const findOneUserData: User = await UserService.findUserById(userId, userLocale)

        res.status(200).json({ data: findOneUserData, message: 'findOne' })
    } catch (error) {
        next(error)
    }
}

/**
 * Get one user in a specific organization, searched by id
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const getUserByIdByOrg = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId: string = req.params.id
        const organizationId: string = req.params.organizationId
        const userLocale = req.cookies.language || locale
        const findOneUserData: User = await UserService.findUserByIdByOrg(userId, organizationId, userLocale)

        res.status(200).json({ data: findOneUserData, message: 'findOne' })
    } catch (error) {
        next(error)
    }
}

/**
 * Creates a new user in the database
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: CreateUserDto = req.body
        const userLocale = req.cookies.language || locale
        const createUserData: User = await UserService.createUser(userData, userLocale)

        res.status(201).json({ data: createUserData, message: 'created' })
    } catch (error) {
        next(error)
    }
}

/**
 * Update the information of a specific user
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId: string = req.params.id
        const userData: UpdateUserDto = req.body
        const userLocale = req.cookies.language || locale
        const updateUserData: User = await UserService.updateUser(userId, userData, userLocale)

        res.status(200).json({ data: updateUserData, message: 'updated' })
    } catch (error) {
        next(error)
    }
}

/**
 * Add one role to a specific user
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const addRoleToUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const userId: string = req.params.id
        const roleId: addRoleDto = req.body
        const userLocale = req.cookies.language || locale

        const findRole: Role = await roleModel.findById(roleId._id)
        if (!findRole) throw new HttpException(409, __({ phrase: 'Role not found', locale }))
        const findMatch = req.user.roles.find(role => {
            if (role._id) {
                return role._id.toString() === findRole._id.toString()
            } else return null
        })
        if (!findMatch) {
            if (!req.role)
                throw new HttpException(409, __({ phrase: 'You do not belong to this organization', locale }))
        }
        const updateUserData: User = await UserService.addRoleToUser(userId, findRole, userLocale)

        res.status(200).json({ data: updateUserData, message: 'updated' })
    } catch (error) {
        next(error)
    }
}

/**
 * Remove one role of a specific user
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const removeRoleToUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const userId: string = req.params.id
        const roleId: addRoleDto = req.body
        const userLocale = req.cookies.language || locale

        const findRole: Role = await roleModel.findById(roleId._id)
        if (!findRole) throw new HttpException(409, __({ phrase: 'Role not found', locale }))
        const findMatch = req.user.roles.find(role => {
            return role._id.toString() === findRole._id.toString()
        })
        if (!findMatch) {
            if (!req.role)
                throw new HttpException(409, __({ phrase: 'You do not belong to this organization', locale }))
        }
        const updateUserData: User = await UserService.removeRoleToUser(userId, findRole, userLocale)

        res.status(200).json({ data: updateUserData, message: 'updated' })
    } catch (error) {
        next(error)
    }
}

/**
 * Deletes a specific user
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId: string = req.params.id
        const userLocale = req.cookies.language || locale
        const deleteUserData: User = await UserService.deleteUser(userId, userLocale)

        res.status(200).json({ data: deleteUserData, message: 'deleted' })
    } catch (error) {
        next(error)
    }
}

/**
 * Get information of the logged user
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const getUserByHeader = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const userId: string = req.user._id.toString()
        const findOneUserData: User = await UserService.findUserById(userId)

        res.status(200).json({ data: findOneUserData, message: 'findOne' })
    } catch (error) {
        next(error)
    }
}

export default {
    getUsersByOrganization,
    getUsers,
    getUserById,
    getUserByIdByOrg,
    createUser,
    updateUser,
    addRoleToUser,
    removeRoleToUser,
    deleteUser,
    getUserByHeader
}
