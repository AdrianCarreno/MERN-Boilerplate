import { model, Schema, Document } from 'mongoose'
import { User } from '@interfaces/users.interface'

const userSchema: Schema = new Schema(
    {
        firstName: {
            type: String,
            required: [true, 'Name is required']
        },
        lastName: {
            type: String,
            required: false
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        emailVerifiedAt: {
            type: Date,
            default: null,
            required: false
        },
        roles: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Role'
            }
        ]
    },
    {
        timestamps: true,
        id: false,
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true
        }
    }
)

userSchema.virtual('fullName').get(function () {
    if (this.lastName) {
        return `${this.firstName} ${this.lastName}`
    }
    return this.firstName
})

userSchema.virtual('name').get(function () {
    return this.fullName
})

userSchema.virtual('authenticationMethods', {
    ref: 'AuthenticationMethod',
    localField: '_id',
    foreignField: 'userId'
})

const userModel = model<User & Document>('User', userSchema)

export default userModel
