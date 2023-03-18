const mongoose = require('mongoose');
const slugify = require('slugify');
const validators = require('validators');
const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        minlength: [10, 'A tour must have a name more than or equal to 10 characters'],
        maxlength: [40, 'A tour must have a name less than or equal to 40 characters']
    },
    slug: String,
    duration:{
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize:{
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty:{
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'A tour must have difficulty either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'A tour must have a rating above 1.0'],
        max: [5, 'A tour must have a rating below 5.0'],
        set: val => Math.round( val * 10 ) / 10 
    },
    ratingsQuantity:{
        type: Number,
        default: 0
    },
    price:{
        type: Number,
        required:[true, 'A tour must have a Price!']
    },
    discountPrice:{
        type: Number,
        validate: {
          validator: function(val) {
           // this only points to current doc on NEW document creation
            return val < this.price;
        },
          message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary:{
        type: String,
        required: [true, 'A tour must have a description'],
        trim: true
    },
    description:{
        type: String,
        trim: true
    },
    imageCover:{
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images:[String],
    startDates:[Date],
    createdAt: {
        type: Date,
		default: Date.now(),
        // select : false will not show createdAt as the result it hides from the result
        select: false
    },
    secretTour: {
        type: Boolean,
        default: false
      },
      startLocation: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
      },
      locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
      ],
      // for Embedded User
      //   guides: Array
      
      // for Reference User
      guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
      ]
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

// index that will sort data in asc if 1 or desc if -1
tourSchema.index( {price: 1, ratingsAverage: -1} );
tourSchema.index( {slug: 1} )
tourSchema.index( {startLocation: '2dsphere'} );

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
  });

// Virtual Populate that will connect tour to reviews
tourSchema.virtual('review', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
})  
  
  // DOCUMENT MIDDLEWARE: runs before .save() and .create()
  tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
  });

  // for Embedded User
//   tourSchema.pre('save',async function(next){
//     const guidePromise = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidePromise);
//     next();
//   });
  
  // tourSchema.pre('save', function(next) {
  //   console.log('Will save document...');
  //   next();
  // });
  
  // tourSchema.post('save', function(doc, next) {
  //   console.log(doc);
  //   next();
  // });
  
  // QUERY MIDDLEWARE
  // tourSchema.pre('find', function(next) {
  tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });
  
    this.start = Date.now();
    next();
  });

  // Populate user details with reference
  tourSchema.pre(/^find/, function(next){
    this.populate({path:'guides', select: '-__v -passwordChangedAt'});
    
    next();
  });
  
  tourSchema.post(/^find/, function(docs, next) {
   // console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
  });
  
  // AGGREGATION MIDDLEWARE
  // tourSchema.pre('aggregate', function(next) {
  //   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  //   // console.log(this.pipeline());
  //   next();
  // });
  

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;