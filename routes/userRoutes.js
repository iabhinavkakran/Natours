const express = require('express');
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController') 

const userRouter = express.Router();

userRouter.post('/signup', authController.signup)
userRouter.post('/login', authController.login)
userRouter.get('/logout', authController.logOut)
userRouter.post('/forgotPassword', authController.forgotPassword)
userRouter.patch('/resetPassword/:token', authController.resetPassword)

// all routes after this middleware will be protected
userRouter.use(authController.protect);

userRouter.patch('/updateMyPassword', authController.updatePassword);
userRouter.patch('/updateMe', userController.updateUserPhoto, userController.resizeUserPhoto, userController.updateMe);
userRouter.delete('/deleteMe', userController.deleteMe);

userRouter
.route('/me')
.get(userController.getMe, userController.getUser);

// all routes after this middleware will be protected and restricted to only admin
userRouter.use(authController.restrictedTo('admin')),

userRouter
.route('/')
.get(authController.protect, userController.getAllUsers)
.post(authController.protect, userController.createUser);

userRouter
.route('/:id')
.get( userController.getUser)
.patch( userController.updateUser)
.delete( userController.deleteUser);

module.exports = userRouter;