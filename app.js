const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const AppError = require("./utils/appError");
const PropertyRoutes = require('./routes/propertyRoutes');
const UserRoutes = require('./routes/userRoutes');
const FavoriteRoutes = require('./routes/favoriteRoutes');
const MailRoutes = require('./routes/mailRoutes');

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



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/users', UserRoutes);
app.use('/api/v1/property', PropertyRoutes);
app.use('/api/v1/favorites', FavoriteRoutes);
app.use('/api/v1/mail', MailRoutes);

app.get('/', (req, res) => {
  res.send('Server running');
});

// Handle all the unhandled Routes
app.all('/{*any}', (req, res, next) => {
  next(
      new AppError(`Unable to find the ${req.originalUrl} in the server!!!`, 404),
  );
});

module.exports = app;
