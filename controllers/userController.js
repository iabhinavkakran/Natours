const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require("../utils/catchAsync");
const User = require('./../models/userModel')
const AppError = require('./../utils/appError');
const factory = require('./factoryHandler');

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

exports.updateUserPhoto = upload.single('photo');

exports.resizeUserPhoto =catchAsync( async(req, res, next) => {
  if(!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
  .resize(500, 500)
  .toFormat('jpeg')
  .jpeg({ quality: 90})
  .toFile(`public/img/users/${req.file.filename}`)

  next()
})


// Filter Updated User Data .. i.e update only name and email
const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el =>{
    if( allowedFields.includes(el) ) newObj[el] = obj[el];
  });
  return newObj;
}

exports.updateMe = catchAsync( async(req, res, next) =>{
  // 1) Throw Error if it POSTs password related update
  if(req.body.password ||  req.body.confirmPassword){
    return next(new AppError('You can not update your password here.'), 400);
  }

  // 2) update user details

  // Filtered the unwanted parameters which user is not allowed to update like: role
  const filteredBody = filteredObj(req.body, 'name', 'email');
  if(req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {new: true, runValidators: true})
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.getMe = (req, res, next) =>{
  req.params.id = req.user.id;
  next();
}
exports.deleteMe = catchAsync( async (req, res, next)=> {
  await User.findByIdAndUpdate(req.user.id, {active: false});
  
  res.status(204).json({
    status: 'success',
    data: {
      user: null
    }
  });
})

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    data: { message: 'No data for this routes please use /signup to Create User.' },
  });
};

exports.getUser = async(req, res, next)=>{
  const user = await User.findById(req.params.id)
  res.status(200).json({
    status: 'success',
    data: user,
    URL: req.params.id
  })
}

exports.getAllUsers =  factory.getAll(User);
//exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
