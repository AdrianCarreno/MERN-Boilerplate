import { Organization } from '@/interfaces/roles.interface'
import { model, Schema } from 'mongoose'

const organizationSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const organizationModel = model<Organization & Document>('Organization', organizationSchema)

export default organizationModel
