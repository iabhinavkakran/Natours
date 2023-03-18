const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp')
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

// Error Handlers
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Requiring Routes
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) Global Middlewares
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

// serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// set securing HTTP headers
// app.use(helmet());
// done this to use mapbox only if not using mapbox then above will work fine

app.use(
  helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: {
          allowOrigins: ['*']
      },
      contentSecurityPolicy: {
          directives: {
              defaultSrc: ['*'],
              scriptSrc: ["* data: 'unsafe-eval' 'unsafe-inline' blob:"]
          }
      }
  })
)

// express-rate-limit
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again later in an hour!'
})
app.use('/api', limiter);

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  };

// Body parser reading data from body into req.body
app.use(express.json( { limit: '10kb' }));
app.use(express.urlencoded({ extended : true , limit: '10kb' }));
app.use(cookieParser());

// Data Sanitization against NoSQL query injection 
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// prevent HTTP Parameter Pollution
app.use(hpp({
  whitelist: ['duration', 'maxGroupSize', 'difficulty', 'ratingsAverage', 'ratingsQuantity', 'price']
}));

// compress all text and html data send to client
app.use(compression());


// test middleware
// app.use((req, res, next)=>{
//    //req.requestTime = new Date().toISOString();
//    console.log(req.cookies)
//    next()
// })

// 2) Routes

app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter); 
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next)=>{
    // 1st
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} route on this server!`
    // })

    // 2nd
    // const err = new Error(`Can't find ${req.originalUrl} route on this server!`);
    // err.statusCode = 404;
    // err.status = 'fail';
    // next(err);

    // 3rd
    next(new AppError(`Can't find ${req.originalUrl} route on this server!`, 404))
})


app.use(globalErrorHandler)

module.exports = app;
