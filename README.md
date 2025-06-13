# Node.js TypeScript Express MongoDB Boilerplate

A production-ready Node.js API boilerplate using TypeScript, Express, and MongoDB with Mongoose.

## Features

- **TypeScript** - Strongly typed language that compiles to JavaScript
- **Express.js** - Fast, unopinionated, minimalist web framework for Node.js
- **MongoDB with Mongoose** - Elegant MongoDB object modeling for Node.js
- **Environment Configuration** - Using dotenv for environment variables
- **Error Handling** - Centralized error handling with custom error classes
- **Type Safety** - Custom type definitions for requests and responses
- **API Validation** - Request data validation using Mongoose schemas
- **Nodemon** - Automatic server restart during development
- **Code Organization** - Clean architecture with separation of concerns
- **Async/Await** - Modern, clean approach to handling asynchronous operations
- **RESTful API** - Organized routes following REST principles

## Prerequisites

- Node.js (>= 14.0.0)
- MongoDB (local or Atlas)
- npm or yarn

## Project Structure

```
.
├── src/                    # Application source code
│   ├── config/             # Configuration files and environment setup
│   │   └── database.ts     # Database connection configuration
│   ├── controllers/        # Route controllers
│   │   └── user.controller.ts
│   ├── middleware/         # Custom middlewares
│   │   └── error.middleware.ts
│   ├── models/             # Mongoose models
│   │   └── user.model.ts
│   ├── routes/             # Express routes
│   │   └── user.routes.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   └── index.ts            # Application entry point
├── dist/                   # Compiled JavaScript output
├── .env                    # Environment variables
├── .env.example            # Example environment variables
├── nodemon.json            # Nodemon configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Getting Started

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/tharsh95/lms-be.git
   cd your-project-name
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file to match your configuration

4. Start the development server
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your_database_name
NODE_ENV=development
```

### Available Scripts

- `npm run dev` - Start the development server with hot-reload using nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled JavaScript for production
- `npm run lint` - Run TypeScript type checking
- `npm run clean` - Remove the dist directory
- `npm run prebuild` - Run clean script before build

## API Endpoints

The boilerplate comes with a basic user API:

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user by ID
- `POST /api/users` - Create a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Health Check

- `GET /health` - Check if the API is running
- `GET /` - Basic route returning a welcome message

## Error Handling

The boilerplate includes a centralized error handling mechanism with custom error classes:

- `ApiError` - Base error class with status code
- `NotFoundError` - 404 errors
- `BadRequestError` - 400 errors
- `UnauthorizedError` - 401 errors
- `ForbiddenError` - 403 errors

Usage example:

```typescript
import { BadRequestError } from '../middleware/error.middleware';

if (!user) {
  throw new BadRequestError('Invalid user data');
}
```

## Development Guidelines

1. **TypeScript**: Write all new code in TypeScript and make use of type definitions.
2. **Error Handling**: Use the custom error classes for consistent error responses.
3. **Controller Structure**: Follow the pattern in `user.controller.ts` for new controllers.
4. **Models**: Define proper schemas and interfaces for all MongoDB models.
5. **Environment Variables**: Add new environment variables to both `.env` and `.env.example`.

## Production Deployment

To prepare for production:

1. Build the application
   ```bash
   npm run build
   ```

2. Start the production server
   ```bash
   npm start
   ```

3. Ensure your environment variables are properly set for production:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_production_mongodb_uri
   ```

## License

This project is licensed under the ISC License. 
