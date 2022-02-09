import { locale } from '@configs/env'
import { addRoleDto, CreateUserDto } from '@dtos/users.dto'
import { User } from '@interfaces/users.interface'
import UserService from '@services/users.service'
import { NextFunction, Request, Response } from 'express'
import { RequestWithUser } from '@interfaces/auth.interface'
import { Role } from '@/interfaces/roles.interface'
import { __ } from 'i18n'
import roleModel from '@/models/roles.model'
import { HttpException } from '@/exceptions/HttpException'
class UsersController {
    public userService = new UserService()

    public getUsersByOrganization = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const userLocale = req.cookies.language || locale
            const findAllUsersData: User[] = await this.userService.findAllUserByOrg(
                req.params.organizationId,
                userLocale
            )
            res.status(200).json({ data: findAllUsersData, message: 'findAll' })
        } catch (error) {
            next(error)
        }
    }

    public getUsers = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const findAllUsersData: User[] = await this.userService.findAllUser()
            res.status(200).json({ data: findAllUsersData, message: 'findAll' })
        } catch (error) {
            next(error)
        }
    }

    public getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id
            const userLocale = req.cookies.language || locale
            const findOneUserData: User = await this.userService.findUserById(userId, userLocale)

            res.status(200).json({ data: findOneUserData, message: 'findOne' })
        } catch (error) {
            next(error)
        }
    }

    public getUserByIdByOrg = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id
            const organizationId: string = req.params.organizationId
            const userLocale = req.cookies.language || locale
            const findOneUserData: User = await this.userService.findUserByIdByOrg(userId, userLocale, organizationId)

            res.status(200).json({ data: findOneUserData, message: 'findOne' })
        } catch (error) {
            next(error)
        }
    }

    public createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: CreateUserDto = req.body
            const userLocale = req.cookies.language || locale
            const createUserData: User = await this.userService.createUser(userData, userLocale)

            res.status(201).json({ data: createUserData, message: 'created' })
        } catch (error) {
            next(error)
        }
    }

    public updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id
            const userData: CreateUserDto = req.body
            const userLocale = req.cookies.language || locale
            const updateUserData: User = await this.userService.updateUser(userId, userData, userLocale)

            res.status(200).json({ data: updateUserData, message: 'updated' })
        } catch (error) {
            next(error)
        }
    }

    public addRoleToUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
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
            const updateUserData: User = await this.userService.addRoleToUser(userId, findRole, userLocale)

            res.status(200).json({ data: updateUserData, message: 'updated' })
        } catch (error) {
            next(error)
        }
    }

    public removeRoleToUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
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
            const updateUserData: User = await this.userService.removeRoleToUser(userId, findRole, userLocale)

            res.status(200).json({ data: updateUserData, message: 'updated' })
        } catch (error) {
            next(error)
        }
    }

    public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id
            const userLocale = req.cookies.language || locale
            const deleteUserData: User = await this.userService.deleteUser(userId, userLocale)

            res.status(200).json({ data: deleteUserData, message: 'deleted' })
        } catch (error) {
            next(error)
        }
    }

    public getUserByHeader = async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.user._id.toString()
            const findOneUserData: User = await this.userService.findUserById(userId)

            res.status(200).json({ data: findOneUserData, message: 'findOne' })
        } catch (error) {
            next(error)
        }
    }
}

export default UsersController
