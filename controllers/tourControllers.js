const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Tour = require('./../models/tourModel');
const factory = require('./factoryHandler');
const multer = require('multer');
const sharp = require('sharp');

// Config Multer
// const multerDisk = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user-id-date-timestamp.extension
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// })

const multerDisk = multer.memoryStorage();
const multerFilter = (req, file, cb) =>{
  if( file.mimetype.startsWith('image')){
    cb(null, true);
  }else{
    cb(new AppError('Not an Image! Please upload only Images.', 400), false);
  }
}
const upload = multer({
  storage: multerDisk,
  fileFilter: multerFilter
})
// if you have single photo
// upload.single('photo'); req.file
// if you have multiple photos but stores in single array
// upload.array({}, {}); req.files

// if you have multiple photos and want to store in multiple locations
exports.updateTourImages = upload.fields([
  {name: 'imageCover', maxCount: 1},
  {name: 'images', maxCount: 3}
]);

exports.resizeTourImages =catchAsync( async(req, res, next) => {

  if(!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`

  // 1) resizing imageCover
  await sharp(req.files.imageCover[0].buffer)
  .resize(2000, 1333)
  .toFormat('jpeg')
  .jpeg({ quality: 90})
  .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Resizing Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours =  async (req, res) => {
//   try{
//     // Execution
//     const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
//     const tours = await features.query;
//     res.status(200).json({
//       status: 'success',
//       result: tours.length,
//       data: {
//         tours: tours,
//       },
//     });
//   }catch(err){
//     res.status(404).json({
//       status: 'failed',
//       message: err 
//     });
//   } 
// };

exports.getTour = factory.getOne(Tour, {path: 'review'} );
// exports.getTour = catchAsync( async (req, res, next) => {
//     const tour = await Tour.findById(req.params.id).populate('review');
//     if(!tour){
//     console.log('***');
//      return next(new AppError('No tour found with that ID', 404))
//     }

//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     }); 
// });

exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync( async (req, res, next) => {
//     const newTour = await Tour.create(req.body);
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
// });

exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync( async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,{new:true,
//     runValidators: true})

//     if(!tour){
//       return next(new AppError('No tour found with that ID', 404))
//      }

//     res.status(201).json({
//       status: 'success',
//       message: 'Updated Successfully',
//       data: { tour },
//     });
// });

exports.deleteTour  = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync( async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id, {new:true,
//       runValidators: true});

//       if(!tour){
//         return next(new AppError('No tour found with that ID', 404))
//        }

//     res.status(200).json({
//       status: 'success',
//       message: 'Deleted Successfully',
//       data: { tour },
//     }); 
// });

// /tours-within/:distance/center/:latlng/unit/:unit'
// /tours-within/233/center/12.77886789,-45.2362879/unit/mi
exports.getToursWithin =catchAsync( async (req, res, next) => {
  const {distance, latlng, unit} = req.params;
  const [lat, lng] = latlng.split(',');

  if(!lat || !lng){
    next(new AppError('Please Provide latitude, longitute in the format lat,lng.'),400)
  }
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //radius is now in radians

  const tours = await Tour.find({
    startLocation: {$geoWithin :{$centerSphere: [[lng, lat], radius]}} 
  })

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours
    }
  })
});

// /distance/:latlng/unit/:unit
exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if(!lat || !lng){
    next(new AppError('Please Provide latitude, longitute in the format lat,lng.'),400)
  }
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001 ; // converting it to mi || km

  const distance =  await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distance
    }
  })

});

exports.getTourStats = async(req, res)=>{
  try{
    const stats = await Tour.aggregate([
      {
        $match: {ratingsAverage: {$gte: 4.5}}
      },
      {
        $group: {
          _id: '$difficulty',
          sumTour: {$sum: 1 },
          numRating: {$sum: '$ratingsQuantity'},
          avgRating: {$avg: '$ratingsAverage'},
          avgPrice: {$avg: '$price'},
          minPrice: {$min: '$price'},
          maxPrice: {$max: '$price'}
        }
      },
      {
        $sort: {avgPrice: 1}
      }
    ]);
    res.status(200).json({
      status: 'success',
      message: 'Stats calculated Successfully',
      data: { stats },
    });

  }catch(err){
    res.status(404).json({
      status: 'failed',
      message: err 
    });
  }
};

exports.getMonthlyPlan = async (req, res)=>{
  try{
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      { $unwind: '$startDates'},
      { $match:{
        startDates:{
          $gte: new Date(`${year}/01/01`),
          $lte: new Date(`${year}/12/31`)
          }
        }},
      { $group: {
        _id: {$month: '$startDates'},
        numTourPlan: { $sum: 1 },
        tours: {$push: '$name'} 
      }},
      { $sort: {_id: 1 }},
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Monthly Plan calculated Successfully',
      data: { plan },
    });

  }catch(err){
    res.status(404).json({
      status: 'failed',
      message: err 
    });
  }
};


/////////////////////////

// const fs = require('fs');
// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
//   );
  
// exports.checkID = (req, res, next, val)=>{
//     if (val > tours.length) {
//       return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
//     }
//     next()
//   }

  // exports.checkBody = (req, res, next) => {
  //   if(!(req.body.name && req.body.price)){
  //     return res.status(400).json({ status: 'fail', message: 'Invalid Tour Details!, Name or Price missing!' });
  //   }
  //   next();
  // }

  // exports.getAllTours = (req, res) => {
  //   res.status(200).json({
  //     status: 'success',
  //     result: tours.length,
  //     data: {
  //       tours: tours,
  //     },
  //   });
  // };
  
  // exports.createTour = (req, res) => {
  //   const newID = tours[tours.length - 1].id + 1;
  //   const newTour = Object.assign({ id: newID }, req.body);
  //   tours.push(newTour);
  //   fs.writeFile(
  //     `${__dirname}/dev-data/data/tours-simple.json`,
  //     JSON.stringify(tours),
  //     (err) => {
  //       res.status(201).json({
  //         status: 'success',
  //         result: tours.length,
  //         data: {
  //           tour: newTour,
  //         },
  //       });
  //     }
  //   );
  // };
  
  // exports.getTour = (req, res) => {
  //   const id = req.params.id * 1;
  //   const tour = tours.find((el) => el.id === id);
  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       tour,
  //     },
  //   });
  // };
  
  // exports.updateTour = (req, res) => {
  //   res.status(201).json({
  //     status: 'success',
  //     data: { message: 'Updated Successfully' },
  //   });
  // };
  
  // exports.deleteTour = (req, res) => { 
  //   res.status(200).json({
  //     status: 'success',
  //     data: { message: 'Deleted Successfully' },
  //   });
  // };