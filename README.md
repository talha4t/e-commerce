# E-Commerce Backend

This project is a robust e-commerce backend built with Node.js, NestJS, PostgreSQL, and Docker. It provides a scalable and efficient foundation for building modern e-commerce applications.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Environment Setup](#environment-setup)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Docker](#docker)
- [CI/CD](#cicd)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v22.x)
- npm (comes with Node.js)
- Docker and Docker Compose
- PostgreSQL (if not using Docker)

## Getting Started

### Environment Setup

1. Clone the repository:

   ```
   git clone https://github.com/talha4t/e-commerce-backend.git
   cd e-commerce-backend
   ```

2. Copy the example environment file and update it with your settings:

   ```
   cp .env.example .env
   ```

3. Update the `.env` file with your specific configuration:
   - Set the `DATABASE_URL` to match your PostgreSQL setup
   - Configure JWT secrets and expiry times
   - Add Cloudinary credentials if using image uploads

### Installation

Install the project dependencies:

```
npm install
```

### Database Setup

If you're not using Docker, ensure your PostgreSQL server is running and the database is created. Then run the migrations:

```
npm run migrate:dev
```

## Running the Application

To start the application in development mode:

```
npm run start:dev
```

For production:

```
npm run build
npm run start:prod
```

## Testing

Run the test suite:

```
npm test
```

For integration tests:

```
npm run test:int
```

## Docker

To run the application using Docker:

1. Start the PostgreSQL container:

   ```
   docker-compose up -d
   ```

2. Build and run the application:
   ```
   docker build -t e-commerce-backend .
   docker run -p 3000:3000 --env-file .env e-commerce-backend
   ```

## CI/CD

This project uses GitHub Actions for continuous integration. The workflow is defined in `.github/workflows/nodejs.yml`. It runs on pushes to `master` and `dev` branches, and on pull requests to these branches.

The CI process includes:

- Setting up Node.js and PostgreSQL
- Installing dependencies
- Building the project
- Running Prisma migrations
- (Commented out) Running integration tests

## API Documentation

API documentation is generated using Swagger. Once the application is running, you can access the Swagger UI at:

```
http://localhost:3000/api
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [UNLICENSED] License.
