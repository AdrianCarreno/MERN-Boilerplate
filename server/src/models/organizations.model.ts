import { Organization } from '@/interfaces/roles.interface'
import { model, Schema, Document } from 'mongoose'

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
        timestamps: true,
        id: false
    }
)

const organizationModel = model<Organization & Document>('Organization', organizationSchema)

export default organizationModel
