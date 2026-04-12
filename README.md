# Rental Marketplace — Backend API
<img width="701" height="143" alt="image" src="https://github.com/user-attachments/assets/6d995353-4ade-40be-952f-23df65590202" />


A production-ready RESTful API for a rental property marketplace, built with Node.js, Express, and MongoDB. Supports property listings, user authentication, favourites, Cloudinary image uploads, and email enquiries — deployed on Vercel.
The Frontend Repo is deployed in Github pages.

Live site : https://ipsrepo.github.io/rental_market_place_Frontend/

Frontend Repo: https://github.com/ipsrepo/rental_market_place_Frontend

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (CommonJS) |
| Framework | Express.js v4 |
| Database | MongoDB (Atlas Cloud + Local) |
| ODM | Mongoose v8 |
| Authentication | JSON Web Tokens (JWT) + bcryptjs |
| Image Storage | Cloudinary + multer-storage-cloudinary |
| Email Service | Nodemailer (Gmail SMTP) |
| Security | Helmet, CORS, express-mongo-sanitize |
| Logging | Morgan |
| Deployment | Vercel (Serverless Node) |
| Dev Tools | Nodemon, ESLint, Prettier |

---

## Steps to Run Locally

### Prerequisites

- Node.js v18+ installed
- MongoDB running in MongoDB Atlas connection string
- A Cloudinary account (free tier is sufficient)
- A Gmail account with an App Password enabled

### 1. Clone the Repository

```bash
git clone https://github.com/ipsrepo/rental_market_place_Backend.git
cd rental_market_place_Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `config.env` file in the project root with the following variables:

```env
PORT=8000

# MongoDB Atlas (cloud)
DATABASE=mongodb+srv://<USERNAME>:<PASSWORD>@rent.vxiffqq.mongodb.net/rent?retryWrites=true&w=majority&tls=true
DATABASE_PASSWORD=your_password

# MongoDB Local (development)
DATABASE_LOCAL=mongodb://127.0.0.1:27017/rentMarket

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret

# JWT
JWT_TOKEN=your_super_secret_key_min_32_characters
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Gmail
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
COMPANY_NAME=Rent Market

# Frontend origin (for CORS)
CLIENT_ORIGIN=http://localhost:3000
```

### 4. Start the Development Server

```bash
npm start
```

The server will start on `http://localhost:8000`.

### 5. Verify the Connection

Open your browser or Postman and visit:

```
GET http://localhost:8000/
→ Response: "Server running"
```

---

## 📁 Project Structure

```
rental_market_place_Backend/
├── app.js                  # Express app setup — middleware, routes, error handling
├── server.js               # Entry point — DB connection, server bootstrap
├── config.env              # Environment variables (not committed to git)
├── vercel.json             # Vercel deployment config
├── package.json
│
├── routes/
│   ├── userRoutes.js       # Auth + user management
│   ├── propertyRoutes.js   # Property CRUD + image upload
│   ├── favoriteRoutes.js   # Saved/favourite properties
│   └── mailRoutes.js       # Property enquiry email
│
├── controllers/
│   ├── authController.js   # Signup, login, JWT, route protection
│   ├── userController.js   # User profile, deactivation
│   ├── propertyController.js # Property operations + image processing
│   ├── favoriteController.js # Favourite add/remove/list
│   ├── mailController.js   # Enquiry email trigger
│   ├── errorController.js  # Global error handler
│   └── handlerFactory.js   # Generic reusable CRUD handlers
│
├── models/
│   ├── userModel.js        # User schema + password hashing
│   ├── propertyModel.js    # Property schema + indexes
│   └── favoriteModel.js    # Favourite schema
│
├── utils/
│   ├── appError.js         # Custom operational error class
│   ├── catchAsync.js       # Async error wrapper
│   ├── apiFeatures.js      # Query filter/sort/limit/pagination
│   └── cloudinary.js       # Cloudinary + Multer storage config
│
└── services/
    └── mail.service.js     # Nodemailer transporter + email templates
```

---

## 🛣 Routes Reference

The API base URL is `/api/v1`. All routes below are relative to this base.

### User Routes — `/api/v1/users`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/signup` | ❌ | Register a new user |
| `POST` | `/login` | ❌ | Login and receive JWT token |
| `GET` | `/:id` | ❌ | Get user by ID |
| `DELETE` | `/:id` | ❌ | Delete user by ID |

---

### Property Routes — `/api/v1/property`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/` | ❌ | Get all properties (with filtering/sorting/pagination) |
| `POST` | `/` | ✅ | Create a new property listing (with image upload) |
| `GET` | `/owner/:ownerId` | ❌ | Get all properties by a specific owner |
| `GET` | `/:id` | ✅ | Get a single property by ID |
| `PATCH` | `/:id` | ✅ | Update a property (with optional new images) |
| `DELETE` | `/:id` | ✅ | Delete a property |

**Image Upload:** The `POST /` and `PATCH /:id` routes accept `multipart/form-data` with a field named `images` (up to 10 files). The first image is set as `primaryimage` automatically.

---

### Favourite Routes — `/api/v1/favorites`

All favourite routes require authentication.

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/` | ✅ | Get all favourites for a user (`?user=userId`) |
| `POST` | `/` | ✅ | Add a property to favourites |
| `DELETE` | `/` | ✅ | Remove a property from favourites |

---

### 📧 Mail Routes — `/api/v1/mail`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/:propertyId` | ✅ | Send an enquiry email to the property owner |

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "+353 87 123 4567",
  "details": "I am interested in viewing this property next week."
}
```

---

## Controllers

### `authController.js`

Handles all authentication logic.

- **`signup`** — Creates a new user using fields from the request body (name, email, mobile, password, passwordConfirm). Returns a JWT token via `createSendToken`.
- **`login`** — Validates email + password. Uses `bcryptjs.compare` to verify the hashed password. Returns a JWT token on success.
- **`protectRoute`** — Middleware that reads the `Authorization: Bearer <token>` header, verifies the JWT, and attaches the decoded user to `req.user`. All protected routes use this as a middleware guard.
- **`createSendToken`** (internal helper) — Signs a JWT using the user's `_id`, sets an HTTP-only cookie, and sends the token in the response body. In production, the cookie is flagged `secure`.

---

### `userController.js`

Handles user profile operations.

- **`getAllUsers`** — Delegates to `factory.getAll(User)` with query features.
- **`getUser`** — Get the user (used to handler factory).
- **`createUser`** — Intentionally not implemented (returns HTTP 500). Users must sign up via `/signup`.
- **`deleteUser`** — Delete the user (used to handler factory).

---

### `propertyController.js`

Handles rental property CRUD operations.

- **`processImages`** (middleware) — Runs before create/update. Converts boolean string values from `multipart/form-data` (e.g., `"true"` → `true`), converts numeric fields (price, bedrooms, bathrooms) to `Number`, and maps uploaded Cloudinary file paths to `primaryimage` and `images` fields.
- **`setOwnerFilter`** (middleware) — Reads `req.params.ownerId` and injects it into `req.query.owner` so `factory.getAll` can filter by owner automatically.
- **`getAllProperties`**, **`getPropertiesByOwner`** — Delegate to `factory.getAll(Property)`.
- **`getProperty`** — Delegates to `factory.getOne(Property)`.
- **`createProperty`**, **`updateProperty`**, **`deleteProperty`** — Delegate to factory handlers.

---

### `favoriteController.js`

Handles saved/favourite properties for authenticated users.

- **`createFavorite`** — Delegates to `factory.createOne(Favorite)`.
- **`deleteFavorite`** — Uses `Favorite.findOneAndDelete({ user, property })` to remove a favourite by both user and property ID (passed in the request body).
- **`getAllFavorites`** — Fetches all favourites for a given user ID (from query string), populating the full `property` document.

---

### `mailController.js`

Handles property enquiry emails.

- **`sendMail`** — Validates name, email, and mobile are present. Fetches the property by ID and populates the owner's name and email. Calls `sendEnquiryEmail` from the mail service. Returns a success message on completion.

---

### `errorController.js`

The global Express error-handling middleware (registered with 4 parameters).

- **Operational errors** (e.g., validation failures, 404s) — sends the message to the client.
- **Unknown errors** — logs internally and sends a generic "Something went wrong!" message to the client.

Specific Mongoose/JWT errors are mapped to human-readable messages:

| Error Type | Handler |
|---|---|
| `CastError` | Invalid MongoDB ObjectId format |
| Code `11000` | Duplicate field value (unique constraint) |
| `ValidationError` | Mongoose schema validation failure |
| `JsonWebTokenError` | Invalid/tampered JWT |
| `TokenExpiredError` | Expired JWT |

---

## Models

### userModel.js
```
name, email, mobile, password, passwordConfirm, savedProperty, active, createdAt, updatedAt.
```

### propertyModel.js
```
title, details, location, price, pricedisplay, propertytype, rentaltype, bedrooms, bathrooms, isprivatebathroom, issharedbed, primaryimage, images, isnew, billsincluded, furnished, availablefrom, available, owner, berrating, active, createdAt, updatedAt.
```

### favoriteModel.js
```
property, user, createdAt, updatedAt.
```

---

## Handler Factory (`handlerFactory.js`)

The factory is a set of higher-order functions that accept a Mongoose `Model` and return a fully working Express route handler. This eliminates repetitive CRUD boilerplate across controllers.

```javascript
// Example usage in a controller:
exports.getAllProperties = factory.getAll(Property);
exports.createProperty  = factory.createOne(Property);
exports.getProperty     = factory.getOne(Property);
exports.updateProperty  = factory.updateOne(Property);
exports.deleteProperty  = factory.deleteOne(Property);
```

| Factory Function | HTTP Method | Description |
|---|---|---|
| `getAll(Model)` | GET | Fetches all documents, applying `APIFeatures` (filter, sort, limit, pagination) |
| `getOne(Model, PopulateOptions?)` | GET `/:id` | Fetches a single document by ID; optionally populates references |
| `createOne(Model)` | POST | Creates and saves a new document from `req.body` |
| `updateOne(Model)` | PATCH `/:id` | Finds by ID and updates; runs validators; returns the updated document |
| `deleteOne(Model)` | DELETE `/:id` | Finds by ID and permanently deletes; returns 200 on success |

All factory handlers are wrapped in `catchAsync` for seamless error propagation.

---

## Error Handling

### `appError.js`

Custom error class used to create consistent and structured operational errors across the application.

### `catchAsync.js`

Utility wrapper for async functions that automatically forwards errors to the global error handler, removing the need for `try/catch`.

### `errorController.js`

Global error handling middleware that manages all errors centrally, showing detailed errors in development and safe messages in production.

---

## Utilities

### `appError.js`

Custom error class for operational errors. Used throughout controllers to create consistent, structured error responses.

### `catchAsync.js`

Wraps async controller functions to avoid repetitive `try/catch` blocks. Any thrown error or rejected promise is passed automatically to Express's error middleware.

### `apiFeatures.js`

A chainable query builder class that enhances Mongoose queries with URL-based controls:

```
GET /api/v1/property?price[gte]=500&location=Dublin&sort=-createdAt&page=2&limit=10
```

| Method | Query Param | Behaviour |
|---|---|---|
| `.filter()` | Any field param | Excludes pagination/sort/field params; converts operators like `gte`, `gt`, `lte`, `lt` to MongoDB `$gte`, `$gt` etc. |
| `.sort()` | `sort=field,-field` | Sorts by comma-separated fields; defaults to `-createdAt name` |
| `.limit()` | `fields=title,price` | Projects only selected fields; excludes `__v` by default |
| `.pagination()` | `page=1&limit=20` | Skips and limits documents; defaults to page 1, limit 100 |

### `cloudinary.js`

Configures the Cloudinary SDK using environment credentials and sets up a `multer-storage-cloudinary` storage engine. Files are stored in the `rent-market/properties` Cloudinary folder and automatically transformed (max 1200×800px, auto quality). Only image MIME types are accepted; file size is capped at 5MB per file. Exports `upload` (multer middleware) and the configured `cloudinary` client.

---

## Services

### `mail.service.js`

Configures a Nodemailer transporter using Gmail SMTP with app password authentication. Verifies the connection on startup.

Exports a single function — `sendEnquiryEmail` — which:

1. Accepts enquirer and property details as a structured object.
2. Constructs a branded HTML email with property info, enquirer contact details, and a reply-to header set to the enquirer's email.
3. Sends the email to the property **owner's** email address.

The email template is fully styled in inline HTML and includes:
- A green-themed header with the company name
- A property info block (title + location)
- An enquirer details table (name, email, mobile, optional message)
- A reply prompt linking directly to the enquirer's email and phone number

---

## 🗄 MongoDB Cluster

### Connection Strategy

The app supports two connection modes via `server.js`:

- **Atlas Cloud** (`DATABASE`) — A full MongoDB Atlas connection string with a placeholder `<PASSWORD>` replaced at runtime (currently commented out in favour of the local connection during development).

Connection options include a 10-second server selection timeout and a 45-second socket timeout to handle slow or intermittent Atlas responses.

### Database: `rentMarket`

Three collections are used:

| Collection | Model | Purpose |
|---|---|---|
| `users` | `User` | Registered user accounts |
| `properties` | `Property` | Rental property listings |
| `favorites` | `Favorite` | Saved properties per user |

---

## Other Notable Features

### Security Middleware (`app.js`)

Uses CORS for cross-origin requests and Morgan for HTTP request logging.

### Image Processing

Images are uploaded via Multer, stored in Cloudinary with optimization, and split into `primaryimage` and additional `images`.

### JWT Authentication

JWT is generated on login/signup, stored in cookies and headers, and verified on protected routes to authenticate users.

---

## Deployed on Vercel

The project is configured for serverless deployment on Vercel using `vercel.json`:


```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "server.js" }
  ]
}
```

All incoming requests at any path are forwarded to `server.js`, which initialises the Express app. This effectively runs the entire Express server as a single Vercel serverless function.

### Environment Variables on Vercel

All variables from `config.env` must be added to the Vercel project's Environment Variables settings (Dashboard → Project → Settings → Environment Variables). The `config.env` file itself is **not** deployed.

### Final Deployement

Deployed and currently running the server in : https://rental-market-place-backend.vercel.app/

---

## Conclusion

This backend provides a complete, production-ready API layer for a rental marketplace application. The architecture follows clean separation of concerns routes, controllers, models, utilities, and services are all clearly delineated. The Handler Factory pattern dramatically reduces code duplication across CRUD operations, while the centralised error handling system ensures consistent, environment-aware error responses throughout. Security is addressed at multiple levels: JWT-based authentication, bcrypt password hashing, Helmet HTTP headers, and input sanitisation. The project is cloud-ready with Cloudinary for media, MongoDB Atlas for data, and Vercel for compute.

---


## References

### General
- **Express.js Documentation** - https://expressjs.com/
- **Mongoose ODM Documentation** - https://mongoosejs.com/docs/
- **MongoDB Atlas** - https://www.mongodb.com/cloud/atlas
- **Cloudinary Node.js SDK** - https://cloudinary.com/documentation/node_integration
- **Nodemailer Documentation** - https://nodemailer.com/
- **Vercel Node.js Deployment** - https://vercel.com/docs/runtimes#official-runtimes/node-js


### Video
- Complete Node.js Course - https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
- Youtube - https://www.youtube.com/@akshaymarch7
          - https://www.youtube.com/@LeelaWebDev
          - other youtube videos


### Others
- Stackoverflow - https://stackoverflow.com/
- Reddit - https://www.reddit.com/r/mongodb/
- dev.to - https://dev.to/
- Clude - https://claude.ai/
