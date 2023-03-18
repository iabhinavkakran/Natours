const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const viewRouter = express.Router();

viewRouter.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewController.getOverview);

viewRouter.get('/tour/:slug',authController.isLoggedIn, viewController.getTour);
viewRouter.get('/login',authController.isLoggedIn, viewController.getLogin);
viewRouter.get('/signup', viewController.getSingUp);

viewRouter.get('/me', authController.protect, viewController.getAccount);

viewRouter.get('/my-tours', authController.protect, viewController.getMyTours);

// updating user data using form post method 
// viewRouter.post('/submit-user-data',authController.protect, viewController.updateUserData);

  

module.exports = viewRouter;