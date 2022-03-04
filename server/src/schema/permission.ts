import AccessControlServices from '@/services/accessControl.service'
import roleModel from '@/models/roles.model'
import { Role } from '@/interfaces/roles.interface'
import { superAdmin } from '@/configs/roles.config'
import { User } from '@/interfaces/users.interface'

/**
 * Function that grants or deny access to an user
 * @param  {User} user user that is trying to perfom action
 * @param  {} args Arguments that could be (organizationId, roleId, or roleData)
 * @param  {string=null} action action to perform
 * @param  {string=null} resource resource to access
 * @returns role found, access bool true if it has acess, isSuperAdmin bool
 */
const grantAccessGraphQL = async function (
    user: User,
    args,
    action: string = null,
    resource: string = null
): Promise<{ role: Role; access: boolean; isSuperAdmin: boolean }> {
    let role: Role
    // Check if the user has at least one role
    if (!Array.isArray(user.roles) || !user.roles.length) {
        return null
    }
    // Check if the user has a global Role
    role = user.roles.find(role => {
        return !role.organizationId
    })
    // If the user has a global role check if it has permission
    if (role) {
        // If the user is the super admin grants permission
        if (role.name === superAdmin.name) return { role, access: true, isSuperAdmin: true }
        const permission = AccessControlServices.check(role._id, resource, action)
        if (permission.granted) {
            return { role, access: true, isSuperAdmin: false }
        }
    }
    try {
        let org = args.organizationId
        // if there is no organization in the request, search for role in request
        // and query the role, to get organization
        if (!org) {
            const roleId = args.roleId || args.roleData._id
            if (roleId) {
                const findRoleData: Role = await roleModel.findById(roleId, 'organizationId')
                org = findRoleData.organizationId.toString()
            }
        }
        // search if the user has a role that is assigned to the organization to make an action
        role = user.roles.find(obj => {
            if (obj.organizationId && org === obj.organizationId._id.toString()) {
                return obj.organizationId
            } else return null
        })
        // if the user has a role that match an organization then check if it has permission
        if (role) {
            const permission = AccessControlServices.check(role._id, resource, action)
            if (!permission.granted) {
                return null
            }
        } else {
            return null
        }
        return { role, access: true, isSuperAdmin: false }
    } catch {
        return null
    }
}

/**
 * Function that grants or deny access if the user is super admin
 * @param  {User} user user that is trying to perfom action
 */
const superAdminAccessGraphQl = function (user: User) {
    let access = false
    if (!Array.isArray(user.roles) || !user.roles.length) return null
    try {
        const superAdminFound: Role = user.roles.find(role => {
            return role.name === superAdmin.name && !role.organizationId
        })
        if (superAdminFound) {
            access = true
            return { superAdminFound, access }
        } else {
            return null
        }
    } catch (error) {
        return null
    }
}

export { grantAccessGraphQL, superAdminAccessGraphQl }
