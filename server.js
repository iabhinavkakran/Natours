const dotenv = require('dotenv');
dotenv.config({path: './config.env'})

process.on('uncaughtException', err => {
  console.log('Error: '+err.name, err.message);
  process.exit(1);
})

const app = require('./app')
const mongoose = require('mongoose');

const Db = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
mongoose.connect(Db).then(()=>console.log("DB connected SuccessfullY!"));


// 3) Start Server
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });

  
process.on('unhandledRejection', err => {
  console.log('Error: '+err.name, err.message);
  console.log('Shutting down the server...!')
  process.exit(1);
})   
 
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
