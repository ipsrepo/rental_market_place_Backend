const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const AppError = require("./utils/appError");


const app = express();

// MiddleWare
// Set Security HTTP Middleware
app.use(helmet()); // It'll produce middleware function and add it to here

app.use(morgan('dev'));

// Setting static file path
app.use(express.static(`${__dirname}/public`));

// Testing middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Handle CORS error
app.use(cors());

app.get('/', (req, res) => {
  res.send('got the response');
});

// Handle all the unhandled Routes
app.all('/{*any}', (req, res, next) => {
  next(
      new AppError(`Unable to find the ${req.originalUrl} in the server!!!`, 404),
  );
});

module.exports = app;
