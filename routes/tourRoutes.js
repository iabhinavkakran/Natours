const express = require('express');
const tourController = require('./../controllers/tourControllers');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');
//const reviewController  = require('./../controllers/reviewController');

const tourRouter = express.Router();

// router.param('id', tourController.checkID)

// POST api/v1/tours/:tourId/reviews
// POST api/v1/review
  // router
  // .route('/:tourId/reviews')
  // .post(authController.protect, authController.restrictedTo('user'),  reviewController.createReview);

tourRouter.use('/:tourId/reviews', reviewRouter);  


// top 5 cheap tour
tourRouter
  .route('/top-5-cheap-tour')
  .get(tourController.aliasTopTours, tourController.getAllTours);


// Tour Stats
tourRouter.route('/tour-stats').get(tourController.getTourStats);
tourRouter.route('/monthly-plan/:year').get(authController.protect, authController.restrictedTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);

tourRouter
.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourController.getToursWithin);

tourRouter
.route('/distance/:latlng/unit/:unit')
.get(tourController.getDistance);

tourRouter
.route('/')
.get(tourController.getAllTours)
.post(authController.protect, authController.restrictedTo('admin', 'lead-guide'), tourController.createTour);

tourRouter
.route('/:id')
.get(tourController.getTour)
.patch(authController.protect, authController.restrictedTo('admin', 'lead-guide'), 
tourController.updateTourImages, tourController.resizeTourImages, tourController.updateTour)
.delete(authController.protect, authController.restrictedTo('admin', 'lead-guide'), tourController.deleteTour);

module.exports = tourRouter;