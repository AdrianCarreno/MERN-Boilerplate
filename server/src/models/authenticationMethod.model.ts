import { model, Schema, Document } from 'mongoose'
import { AuthenticationMethod } from '@interfaces/auth.interface'

const authenticationMethodSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: ['OAUTH', 'PASSWORD']
        },
        password: {
            type: String,
            required: function () {
                return this.type === 'PASSWORD'
            }
        },
        accessToken: {
            type: String,
            required: function () {
                return this.type === 'OAUTH'
            }
        },
        refreshToken: {
            type: String,
            required: function () {
                return this.type === 'OAUTH'
            }
        },
        expiresIn: {
            type: Number,
            required: function () {
                return this.type === 'OAUTH'
            }
        }
    },
    {
        timestamps: true,
        id: false
    }
)

authenticationMethodSchema.index({ userId: 1, type: 1 }, { unique: true })

authenticationMethodSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
})

const authenticationMethodModel = model<AuthenticationMethod & Document>(
    'AuthenticationMethod',
    authenticationMethodSchema
)

export default authenticationMethodModel
