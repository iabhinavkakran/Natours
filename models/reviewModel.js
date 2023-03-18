const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be Empty']
    },
    rating: {
        type: Number,
        min: [1, 'A review must have a rating above 1.0'],
        max: [5, 'A review must have a rating below 5.0']
    },
    createdAt: {
        type: Date,
		default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a Tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a User']
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);

// only 1 review per Tour per user
reviewSchema.index({ tour: 1, user: 1}, {
    unique:true
});

// Populate tour and user details with reference
reviewSchema.pre(/^find/, function(next){
   this.populate({path:'tour', select: 'name'}).populate({path:'user', select: 'name photo'})
    // this.populate({path:'user', select: 'name'})
    next();
  });

  // calculating average rating 
  reviewSchema.statics.calcAverageRatings = async function(tourId) {
   const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1},
                avgRating: { $avg: '$rating'}
            }
        }
    ])

    // updating Tour ratingAverage and ratingsQuantity fields 
    if(stats.length > 0 ) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].nRating
        });
    }else{
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0
        });
    }
  };

  // calling calcAverageRatings here using middleware
  reviewSchema.post('save', function(){
    // here this is refering to current review
    this.constructor.calcAverageRatings(this.tour);
  })

  // findByIdAndUpdate & findByIdAndDelete
  reviewSchema.pre(/^findOneAnd/, async function(next){
     this.r = await this.findOne();
    next();
  })
  reviewSchema.post(/^findOneAnd/, async function(){
    await this.r.constructor.calcAverageRatings(this.r.tour);
  })

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;