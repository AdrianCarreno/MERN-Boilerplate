import { AccessControl } from 'accesscontrol'
import bcrypt from 'bcrypt'
import { __ } from 'i18n'
import { ObjectId } from 'mongoose'
import { env } from '@/configs'
import { User } from '@/interfaces/users.interface'
import { CreateRoleDto, UpdateRoleDto } from '@/dtos/roles.dto'
import userModel from '@/models/users.model'
import organizationModel from '@/models/organizations.model'
import { HttpException } from '@/exceptions/HttpException'
import { superAdmin } from '@/configs/roles.config'
import RoleModel from '@/models/roles.model'
import { Organization, Role } from '@interfaces/roles.interface'
import { isEmpty } from '@/utils/util'

/*
    Documentation: https://www.npmjs.com/package/accesscontrol
    To check permissions using ac in any endpoint you should use the following format:
    ac.cant(<user.role>).createAny(<resource_name>) where user.role is the id of the
    assigned role and resource_name the mongoose collection name of the resource.
*/
const ac = new AccessControl()

/**
 * Initiates the Access Control of the server by first creating or updating the adminRole
 * given in the environment configuration object, then it grants all the permissions using
 * function updateAccessControl inside the corresponding function of updateRole or createRole.
 * Logs info to console from the result of this execution
 */
const initAccessControl = async () => {
    const role = RoleModel
    try {
        const findRole = await role.findOne({ name: superAdmin.name })
        let adminResult = ''
        if (findRole) {
            await updateSuperAdmin(findRole._id, superAdmin.resources)
            adminResult = 'Super admin Role updated'
        } else {
            await createRoleAdmin(superAdmin)
            adminResult = 'Super admin Role created'
        }
        console.info(`Initialized access control. ${adminResult}`)
    } catch (error) {
        console.error(error)
    }
}

/**
 * Allows to update access control
 */
const updateAccessControl = async () => {
    const roles = await RoleModel.find()
    const parsedRoles = {}

    /*
        Format should be:
        {
            <role._id>: {
                <resource_name>: {
                    <premission_type>: [<accesses>]
                }
            }
        }
    */
    roles?.forEach(role => {
        parsedRoles[role._id] = role.resources
    })
    ac.setGrants(parsedRoles)
    return 'Access Control updated'
}

/**
 * Function to check permissions of a role against the Access Control.
 * @param {*} role Id of the role in DB
 * @param {*} resource Name of the resource given by mongoose collection
 * @param {*} type Type of action over the resource (e.g. createAny or createOwn)
 * @returns AccessControl~Permission, defines the granted or denied access permissions to the target resource and role
 */
const check = (role, resource, type) => {
    switch (type) {
        case 'createAny':
            return ac.can(role.toString()).createAny(resource)
        case 'readAny':
            return ac.can(role.toString()).readAny(resource)
        case 'updateAny':
            return ac.can(role.toString()).updateAny(resource)
        case 'deleteAny':
            return ac.can(role.toString()).deleteAny(resource)
        case 'createOwn':
            return ac.can(role.toString()).createOwn(resource)
        case 'readOwn':
            return ac.can(role.toString()).readOwn(resource)
        case 'updateOwn':
            return ac.can(role.toString()).updateOwn(resource)
        case 'deleteOwn':
            return ac.can(role.toString()).deleteOwn(resource)
        default:
            return ac.can(role.toString()).readAny('NONRESOURCE')
    }
}

/**
 * Allows to create a role with a name (should be a generic name to translate in frontend)
 * and a resources object that should follow the format example shown in models/permissionRole.js.
 * Uses function updateAccessControl to update the Access Control after the successful creation of the role
 * @param {*} roleInfo Information of the role to create
 * @param {*} org Organization id associated with the role
 * @param {*} rolesMatchs Boolean if the resources to add into the role are ok
 * @param {*} locale
 * @returns PermissionRoles, the newly created permission role document
 */
const createRole = async (
    roleInfo: CreateRoleDto,
    org: string,
    rolesMatchs: boolean,
    locale: string = env.locale
): Promise<Role> => {
    if (rolesMatchs) {
        const organizationFound = await organizationModel.findById(org)
        try {
            const newRole = RoleModel.create({
                name: roleInfo.name,
                organizationId: org,
                resources: roleInfo.resources,
                description: roleInfo.description
            })

            await updateAccessControl()
            return newRole
        } catch (error) {
            if (organizationFound) {
                throw new HttpException(
                    409,
                    __(
                        { phrase: 'Role {{role}} already exists for organization {{organization}}', locale },
                        { role: roleInfo.name, organization: organizationFound.name }
                    )
                )
            } else {
                throw new HttpException(409, __({ phrase: 'Could not find organization', locale }))
            }
        }
    } else throw new HttpException(409, __({ phrase: 'You do not have permission to create that role', locale }))
}

/**
 * Allows to create a role with a name (should be a generic name to translate in frontend)
 * and a resources object that should follow the format example shown in models/permissionRole.js.
 * Uses function updateAccessControl to update the Access Control after the successful creation of the role
 * @param {*} roleInfo Information of the role to create
 * @param {*} rolesMatchs Boolean if the resources to add into the role are ok
 * @param {*} locale
 * @returns PermissionRoles, the newly created permission role document
 */
const createGlobalRole = async (
    roleInfo: CreateRoleDto,
    rolesMatchs: boolean,
    locale: string = env.locale
): Promise<Role> => {
    if (rolesMatchs) {
        try {
            const newRole = RoleModel.create({
                name: roleInfo.name,
                resources: roleInfo.resources,
                description: roleInfo.description
            })
            await updateAccessControl()
            return newRole
        } catch (error) {
            throw new HttpException(409, __({ phrase: 'Role already exists', locale }))
        }
    } else throw new HttpException(409, __({ phrase: 'You do not have permission to create that role', locale }))
}

/**
 * Allows to create a role with a name (should be a generic name to translate in frontend)
 * and a resources object that should follow the format example shown in models/permissionRole.js.
 * Uses function updateAccessControl to update the Access Control after the successful creation of the role
 * @param {*} roleInfo Information of the role to create
 * @returns PermissionRoles, the newly created permission role document
 */
const createRoleAdmin = async (roleInfo: CreateRoleDto): Promise<Role> => {
    try {
        const findAdmin = await userModel.findOne({ email: process.env.EMAIL })

        const newRole = new RoleModel({
            name: roleInfo.name,
            resources: roleInfo.resources
        })
        await newRole.save()
        findAdmin.roles.push(newRole._id)
        findAdmin.save()
        await updateAccessControl()
        return newRole
    } catch (error) {
        // Add error message to be sent
        throw new Error(error.message)
    }
}

/**
 * Updates a role using it's id and a new resources object, this object will completely replace the old
 * one so it needs to have all the attributes setted for the role.
 * Uses function updateAccessControl to update the Access Control after the successful update of the role
 * @param {*} roleId ID of the role to update in DB
 * @param {*} newResources New Object to replace old resources access definitions. Old definition will change completely
 * @returns PermissionRoles, the updated permission role document
 */
const updateSuperAdmin = async (roleId: ObjectId, newResources: object) => {
    try {
        const updated = await RoleModel.findByIdAndUpdate(roleId, { resources: newResources }, { new: true })
        if (!updated) {
            throw new Error()
        }
        await updateAccessControl()
        return updated
    } catch (error) {
        // Add error message to be sent
        throw new Error(error.message)
    }
}

/**
 * Allows to update a role using id and new information
 * @param  {Role} roleInfo Information to update
 * @param  {string=env.locale} locale
 */
const updateRole = async (roleInfo: Role, locale: string = env.locale) => {
    const updated = await RoleModel.findByIdAndUpdate(
        roleInfo._id,
        {
            name: roleInfo.name,
            resources: roleInfo.resources,
            description: roleInfo.description
        },
        { new: true }
    )
    if (!updated) throw new HttpException(409, __({ phrase: 'Role not found', locale }))
    await updateAccessControl()
    return updated
}

/**
 * Deletes a role using it's id.
 * Uses function updateAccessControl to update the Access Control after the successful deletion of the role
 * @param {*} roleId ID of the role to delete in DB
 * @returns PermissionRoles, the deleted permission role document
 */
const deleteRole = async (roleId: string, locale: string = env.locale) => {
    const deleted = await RoleModel.findByIdAndDelete(roleId)
    if (!deleted) throw new HttpException(409, __({ phrase: 'Role not found', locale }))
    await updateAccessControl()
    return deleted
}

/**
 * Search for all roles in an organization
 * @param  {Organization} orgInfo information of the organiuzation to search
 * @returns Array of roles
 */
const findRolesByOrg = async (orgInfo: Organization): Promise<Role[]> => {
    const roles: Role[] = await RoleModel.find({ organizationId: orgInfo })

    return roles
}

/**
 * Find all roles in DB
 * @returns Array of roles
 */
const findAllRoles = async (): Promise<Role[]> => {
    const roles: Role[] = await RoleModel.find().populate('organizationId')

    return roles
}

/**
 * Updates a role
 * @param  {string} roleId Id of the role to update
 * @param  {UpdateRoleDto} roleData information to update
 * @param  {string=env.locale} locale
 * @returns Updated role
 */
const updateRoleById = async (roleId: string, roleData: UpdateRoleDto, locale: string = env.locale): Promise<Role> => {
    const updated = await RoleModel.findByIdAndUpdate(roleId, roleData, { new: true })
    if (!updated) throw new HttpException(404, __({ phrase: 'Role not found', locale }))
    await updateAccessControl()
    return updated
}

/**
 * Creates an account to use as a super admin with .env
 * @returns new user
 */
const createSuperAdmin = async (): Promise<User> => {
    const hashedPassword = await bcrypt.hash(process.env.PASSWORD, 10)
    const user: User = await userModel.findOneAndUpdate(
        { email: process.env.EMAIL },
        {
            $setOnInsert: {
                firstName: process.env.FIRSTNAME,
                ...(!isEmpty(process.env.LASTNAME) && { lastName: process.env.LASTNAME }),
                email: process.env.EMAIL,
                password: hashedPassword
            }
        },
        { new: true, upsert: true }
    )

    return user
}

export default {
    ac,
    check,
    createRole,
    createGlobalRole,
    createSuperAdmin,
    deleteRole,
    findRolesByOrg,
    findAllRoles,
    initAccessControl,
    updateRole,
    updateAccessControl,
    updateRoleById
}
