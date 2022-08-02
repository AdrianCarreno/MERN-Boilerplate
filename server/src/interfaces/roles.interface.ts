import { ObjectId } from 'mongoose'

export interface Organization {
    _id: ObjectId
    name: string
    description?: string
}

export interface Role {
    _id: ObjectId
    name: string
    resources: object
    organizationId: Organization
    description: string
}

export interface RoleId {
    _id: ObjectId
}
