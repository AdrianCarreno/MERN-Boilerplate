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
        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

userSchema.virtual('fullName').get(function () {
    if (this.lastname) {
        return `${this.firstname} ${this.lastname}`
    }
    return this.firstname
})

userSchema.virtual('name').get(function () {
    return this.fullName
})

const userModel = model<User & Document>('User', userSchema)

export default userModel
