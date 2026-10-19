import express from 'express'
import upload from '../middlewares/multer.js'
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointmnet, paymentRazorpay, verifyRazorpay } from '../controllers/userController.js'
import { chatWithBot } from '../controllers/chatController.js'
import authUser from '../middlewares/authUser.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile)
userRouter.post('/book-appointment', authUser, bookAppointment)
userRouter.get('/appointments', authUser, listAppointment)
userRouter.post('/cancel-appointment', authUser, cancelAppointmnet)
 
userRouter.post('/payment-razorpay', authUser, paymentRazorpay)
userRouter.post('/verify-razorpay', authUser, verifyRazorpay)
userRouter.post('/chat', chatWithBot)

export default userRouter