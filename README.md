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
- **File Upload** - Support for file uploads with Cloudinary integration
- **AI Integration** - DeepSeek AI integration for content generation
- **PDF Processing** - PDF parsing and text extraction capabilities
- **Authentication** - JWT-based authentication system
- **Role-Based Access Control** - User role management and authorization
- **Logging** - Comprehensive logging system
- **CORS** - Cross-Origin Resource Sharing support
- **Documentation** - API documentation with Swagger/OpenAPI

## Prerequisites

- Node.js (>= 14.0.0)
- MongoDB (local or Atlas)
- npm or yarn
- Cloudinary account (for file uploads)
- Gemini AI API key (for AI features)

## Project Structure

```
.
├── src/                    # Application source code
│   ├── config/             # Configuration files and environment setup
│   │   ├── database.ts     # Database connection configuration
│   │   └── cloudinary.ts   # Cloudinary configuration
│   ├── controllers/        # Route controllers
│   │   ├── user.controller.ts
│   │   ├── course.controller.ts
│   │   └── assignment.controller.ts
│   ├── middleware/         # Custom middlewares
│   │   ├── error.middleware.ts
│   │   ├── auth.middleware.ts
│   │   └── upload.middleware.ts
│   ├── models/             # Mongoose models
│   │   ├── user.model.ts
│   │   ├── course.model.ts
│   │   └── assignment.model.ts
│   ├── routes/             # Express routes
│   │   ├── user.routes.ts
│   │   ├── course.routes.ts
│   │   └── assignment.routes.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── upload.ts
│   │   ├── deepseek.ts
│   │   └── prompt.ts
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
   cd lms-be
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
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/your_database_name

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# DeepSeek AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Available Scripts

- `npm run dev` - Start the development server with hot-reload using nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled JavaScript for production
- `npm run lint` - Run TypeScript type checking
- `npm run clean` - Remove the dist directory
- `npm run prebuild` - Run clean script before build
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Courses

- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get a specific course
- `POST /api/courses` - Create a new course
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course
- `POST /api/courses/:id/assignments` - Add assignment to course
- `GET /api/courses/:id/assignments` - Get course assignments

### Assignments

- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get a specific assignment
- `POST /api/assignments` - Create a new assignment
- `PUT /api/assignments/:id` - Update an assignment
- `DELETE /api/assignments/:id` - Delete an assignment

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
- `ValidationError` - 422 errors
- `InternalServerError` - 500 errors

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
3. **Controller Structure**: Follow the pattern in existing controllers for new controllers.
4. **Models**: Define proper schemas and interfaces for all MongoDB models.
5. **Environment Variables**: Add new environment variables to both `.env` and `.env.example`.
6. **Testing**: Write unit tests for new features and maintain test coverage.
7. **Documentation**: Update API documentation when adding new endpoints.
8. **Code Style**: Follow the project's code style guidelines.
9. **Git Workflow**: Follow the branching strategy and commit message format.
10. **Security**: Implement proper security measures for new features.

## Testing

The project uses Jest for testing. To run tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Security Best Practices

1. **Authentication**: Use JWT for authentication
2. **Authorization**: Implement role-based access control
3. **Input Validation**: Validate all user inputs
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **CORS**: Configure CORS properly
6. **Security Headers**: Use Helmet.js for security headers
7. **Password Hashing**: Use bcrypt for password hashing
8. **File Upload**: Validate and sanitize file uploads
9. **Error Handling**: Don't expose sensitive information in errors
10. **Logging**: Implement secure logging practices

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
   JWT_SECRET=your_production_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_production_cloud_name
   CLOUDINARY_API_KEY=your_production_api_key
   CLOUDINARY_API_SECRET=your_production_api_secret
   DEEPSEEK_API_KEY=your_production_deepseek_api_key
   CORS_ORIGIN=your_production_frontend_url
   ```

4. Set up monitoring and logging
5. Configure SSL/TLS
6. Set up backup procedures
7. Implement CI/CD pipeline

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email support@example.com or open an issue in the GitHub repository.

## Acknowledgments

- Express.js team for the amazing framework
- MongoDB team for the database
- TypeScript team for the language
- All contributors who have helped shape this project
