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
const check = (role: ObjectId, resource: string, type: string) => {
    const typeResponses = {
        createAny: ac.can(role.toString()).createAny(resource),
        readAny: ac.can(role.toString()).readAny(resource),
        updateAny: ac.can(role.toString()).updateAny(resource),
        deleteAny: ac.can(role.toString()).deleteAny(resource),
        createOwn: ac.can(role.toString()).createOwn(resource),
        readOwn: ac.can(role.toString()).readOwn(resource),
        updateOwn: ac.can(role.toString()).updateOwn(resource),
        deleteOwn: ac.can(role.toString()).deleteOwn(resource)
    }
    if (!Object.keys(typeResponses).includes(type)) return ac.can(role.toString()).readAny('NONRESOURCE')
    return typeResponses[type]
}
/**
 * Allows to create a role with a name (should be a generic name to translate in frontend)
 * and a resources object that should follow the format example shown in models/permissionRole.js.
 * Uses function updateAccessControl to update the Access Control after the successful creation of the role
 * @param {*} role Generic name to use for the role (e.g. admin)
 * @param {*} resources Object with the resource type of access and attributes (e.g. { User: { 'create:any': ['*'], ... } })
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

const updateRole = async (roleInfo: Role, locale: string = env.locale) => {
    const updated = await RoleModel.findByIdAndUpdate(roleInfo._id, { resources: roleInfo.resources }, { new: true })
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

const findRolesByOrg = async (orgInfo: Organization) => {
    const roles: Role[] = await RoleModel.find({ organizationId: orgInfo })

    return roles
}

const findAllRoles = async () => {
    const roles: Role[] = await RoleModel.find().populate('organizationId')

    return roles
}

const updateRoleById = async (roleId: string, roleData: UpdateRoleDto, locale: string = env.locale) => {
    const updated = await RoleModel.findByIdAndUpdate(roleId, roleData, { new: true })
    if (!updated) throw new HttpException(404, __({ phrase: 'Role not found', locale }))
    await updateAccessControl()
    return updated
}

const createSuperAdmin = async (): Promise<User> => {
    const findUser: User = await userModel.findOne({ email: process.env.EMAIL })

    if (findUser) {
        return
    }

    const hashedPassword = await bcrypt.hash(process.env.PASSWORD, 10)

    const adminInfo = {
        firstName: process.env.FIRSTNAME,
        lastName: process.env.LASTNAME,
        email: process.env.EMAIL
    }

    const createUserData: User = await userModel.create({ ...adminInfo, password: hashedPassword })

    return createUserData
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
