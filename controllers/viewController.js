const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync'); 

exports.getOverview = catchAsync( async(req, res, next)=>{
    // 1) get the tour data from database
    const tours = await Tour.find();

    // 2) build template

    // 3) render the template using tour data from 1)
    res.status(200).render('overview', {
      title: 'All Tours',
      tours
    })
});

exports.getTour = catchAsync( async(req, res, next)=>{
    // 1) Get the data for requested tour with guides and reviews
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
      path: 'review',
      fields: 'review rating user'
    })
    // 2) build template
    // console.log(tour.review[0].user);
    if (!tour) {
      return next(new AppError('There is no tour with that name.', 404));
    }

    // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
  });  

  exports.getLogin =(req, res)=>{
    res.status(200).render('login', {
      title: 'Log into your account'
    })
  };

  exports.getSingUp =(req, res)=>{
    res.status(200).render('signup', {
      title: 'Create a Natours account'
    })
  }

  exports.getAccount = (req, res) => {
    res.status(200).render('account', {
      title: 'Your Account'
    })
  };

  exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });
  
    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });
  
    res.status(200).render('overview', {
      title: 'My Tours',
      tours
    });
  });

  exports.updateUserData =catchAsync( async(req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    });

    res.status(200).render('account', {
      title: 'Your Account',
      user: updatedUser
    })
  });