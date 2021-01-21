const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const app = express();

// MIDDLEWARES
app.use(morgan('dev')); // log

// middleware can modifies incoming data
// express.json() is a middleware that can convert request to json format
app.use(express.json());
// Servce static file
app.use(express.static(`${__dirname}/public`));

////////////// ROUTES ////////////////
// Mounting Router to MIDDLEWARE
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Handle unhandled routes
app.all('*', (req, res, next) => {
    // whenever we pass anything in next
    // express will know it's error
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ERROR Handling Middleware
app.use(globalErrorHandler);

module.exports = app;