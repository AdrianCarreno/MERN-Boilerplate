import AuthController from '@controllers/auth.controller'
import { CreateUserDto, LoginUserDto } from '@dtos/users.dto'
import authMiddleware from '@middlewares/auth.middleware'
import validationMiddleware from '@middlewares/validation.middleware'
import { Router } from 'express'

const router = Router()

router.post(`/signup`, validationMiddleware(CreateUserDto, 'body'), AuthController.signUp)
router.post(`/login`, validationMiddleware(LoginUserDto, 'body'), AuthController.logIn)
router.post(`/logout`, authMiddleware(), AuthController.logOut)
router.post(`/verify`, AuthController.verifyUserEmail)
router.post(`/forgot-password`, AuthController.forgotPassword)
router.post(`/reset-password`, AuthController.resetPassword)

export default router
