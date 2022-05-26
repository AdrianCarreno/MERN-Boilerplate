import { Role } from './roles.interface'
import { ObjectId } from 'mongoose'
export interface User {
    _id: ObjectId
    firstName: string
    lastName: string
    fullName: string
    name: string
    email: string
    emailVerifiedAt?: Date | null
    createdAt?: Date
    updatedAt?: Date
    roles: Array<Role>
}
