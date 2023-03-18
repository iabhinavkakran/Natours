const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
        trim: true  
      },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type:String, 
        default: 'default.jpg'
    },
    role:{
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Must have a password!'],
        minlength: [8, 'password must have 8 characters'],
        select: false     
    },
    confirmPassword: {
        type: String,
        required: [true, 'Must have a same password!'],
        validate:{
            validator: function(el){
                return el === this.password;
            },
            message: 'Password must be the same!'
        }     
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpiredAt: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

userSchema.pre('save', async function(next){
    // only run this if the password is modified 
    if(! this.isModified('password')) return next();

    // hasing with the cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
});

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000; // -1000 make sure it has before the actual password created
    next();
})

// Query Middleware
userSchema.pre(/^find/, function(next){
    this.find({active: true});
    next();
});

userSchema.methods.correctPassword =  async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);  
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
  
      return JWTTimestamp < changedTimestamp;
    }
  
    // False means NOT changed
    return false;
  };

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpiredAt = Date.now() + ( 10 * 60 * 1000 );

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;