const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception...❌❌❌');
  const error = Object.create(err);
  console.log(error.name, error.message);
  process.exit(1);
});

const app = require('./app');


const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// const DB = process.env.DATABASE_LOCAL;
console.log('🔍 DB string:', DB);

mongoose
    .connect(DB, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    .then(() => {
      console.log('✅ DB Connected Successfully');
    })
    .catch((err) => {
      console.log('❌ DB Connection Failed:', err.message);
      process.exit(1);
    });

 // console.log(app.get('env'));
 // console.log(process.env);

// Start the Server
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App Running in post ${PORT}`);
});


process.on('unhandledRejection', (err) => {
  console.log('UnHandled Rejection...❌❌❌');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
