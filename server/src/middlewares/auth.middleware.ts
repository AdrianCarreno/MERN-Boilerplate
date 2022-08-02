import { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'
import { HttpException } from '@exceptions/HttpException'
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface'
import userModel from '@models/users.model'
import { keys } from '@/configs'

/**
 * Authentication of the token saved in the cookie, if a user is found
 * the information of the user is saved
 * @param  {any={_id:1}} projection projection of the user query
 */
const authMiddleware = function (projection: any = { _id: 1 }) {
    return async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            const Authorization = req.cookies.Authorization || req.header('Authorization').split('Bearer ')[1] || null
            if (Authorization) {
                const secretKey: string = keys.secretKey
                const verificationResponse = (await jwt.verify(Authorization, secretKey)) as DataStoredInToken
                const userId = verificationResponse._id
                const findUser = await userModel.findById(userId, projection).populate({
                    path: 'roles',
                    model: 'Role',
                    populate: { path: 'organizationId', model: 'Organization' }
                })
                if (findUser) {
                    req.user = findUser
                    next()
                } else {
                    next(new HttpException(401, 'Wrong authentication token'))
                }
            } else {
                next(new HttpException(404, 'Authentication token missing'))
            }
        } catch (error) {
            next(new HttpException(401, 'Wrong authentication token'))
        }
    }
}

export default authMiddleware
