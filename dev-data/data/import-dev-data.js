const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

dotenv.config({path: './../../config.env'});

const Db = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
mongoose.connect(Db).then(()=>console.log("DB connected SuccessfullY!"));

const tours = JSON.parse((fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')));
const users = JSON.parse((fs.readFileSync(`${__dirname}/users.json`, 'utf-8')));
const reviews = JSON.parse((fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')));


// import data

const importData = async ()=>{
    try{
       await Tour.create(tours);
       await Review.create(reviews);
       await User.create(users, { validateBeforeSave: false });
        console.log("Data imported Successfully");
    }catch(err){
        console.log(err);
    }
    process.exit();
}

// delete data

const deleteData = async ()=>{
    try{
        await Tour.deleteMany();
        await Review.deleteMany();
        await User.deleteMany();
        console.log("Data deleted Successfully");
    }catch(err){
        console.log(err);
    }
    process.exit();
}

if(process.argv[2]==='--import'){
    importData()
}else if(process.argv[2]==='--delete'){
    deleteData();
}