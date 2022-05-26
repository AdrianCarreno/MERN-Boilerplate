import { Role } from '@/interfaces/roles.interface'
import { model, Schema, Document } from 'mongoose'
const roleSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization'
        },
        description: {
            type: String
        },
        resources: {
            /*
            Format
            <Resource Name>: {
                '<actionName>:<possession>: <arrayOfAttributes>
            }
            Example, Name the resource with the mongoose data name
            This will allow to check access control when creating own users, this could mean
            different things depending on how it is checked. For example own users could mean
            a shift manager with permissions over a workshop under an organization, so if they
            have create:own, they can create users assigned to this workshop. It does not force
            you to only self data or any data.
            User: {
                'create:own': ['*']
                'read:any': ['*', '!_id']
            }
        */
        }
    },
    {
        timestamps: true,
        id: false
    }
)

roleSchema.index({ name: 1, organizationId: 1 }, { unique: true })
const roleModel = model<Role & Document>('Role', roleSchema)

export default roleModel
