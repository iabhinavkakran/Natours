const express = require('express');
const reviewController = require('./../controllers/reviewController')
const authController = require('./../controllers/authController');
const reviewRouter = express.Router( { mergeParams: true });

// POST api/v1/tours/:tourId/reviews
// POST api/v1/review

// all routes after this middleware will be protected
reviewRouter.use(authController.protect);

reviewRouter
  .route('/').get(reviewController.getAllReviews)
  .post(authController.restrictedTo('user'), reviewController.setTourUserIDs, reviewController.createReview);

reviewRouter
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restrictedTo('admin', 'user'), reviewController.updateReview) 
  .delete(authController.restrictedTo('admin', 'user'), reviewController.deleteReview);

module.exports = reviewRouter;