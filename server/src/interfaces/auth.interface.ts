import { Request } from 'express'
import { User } from '@interfaces/users.interface'
import { ObjectId } from 'mongoose'
import { Role } from './roles.interface'
export interface DataStoredInToken {
    _id: ObjectId
}

export interface TokenData {
    token: string
    expiresIn: number
}

export interface RequestWithUser extends Request {
    user: User
    role: Role
}
