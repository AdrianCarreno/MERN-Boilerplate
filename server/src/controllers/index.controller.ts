import { NextFunction, Request, Response } from 'express'
/**
 * @param  {Request} req http request arguments
 * @param  {Response} res http response arguments
 * @param  {NextFunction} next next matching route
 */
const index = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.sendStatus(200)
    } catch (error) {
        next(error)
    }
}

export default { index }
