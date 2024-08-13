# E-Commerce Backend

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-v16.13.1-green.svg)
![NestJS](https://img.shields.io/badge/nestjs-v9.0.0-red.svg)
![Prisma](https://img.shields.io/badge/prisma-v4.1.1-blue.svg)
![Postgres](https://img.shields.io/badge/postgres-v14.1-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-v4.4.4-blue.svg)

## Overview

This repository contains the backend for an e-commerce platform built using Node.js, NestJS, Prisma ORM, PostgreSQL, and TypeScript. The project is designed to provide a scalable, efficient, and secure foundation for managing e-commerce operations, including user authentication, product management, shopping cart functionality, and order processing.

## Features

- **User Authentication:** Secure authentication using JWT, role-based access control, and Argon2 password hashing.
- **Product Management:** CRUD operations for products, including filtering, sorting, and pagination.
- **Shopping Cart:** Add, update, remove items from the cart, and retrieve the current cart status.
- **Order Management:** Process user orders, track order status, and manage order history.
- **Database:** PostgreSQL as the relational database with Prisma ORM for seamless database interaction.
- **Documentation:** Integrated API documentation using Swagger.

## Technologies

- **Node.js**: JavaScript runtime environment
- **NestJS**: Progressive Node.js framework for building efficient, reliable, and scalable server-side applications
- **Prisma**: Next-generation ORM that connects to your database with ease
- **PostgreSQL**: Powerful, open-source object-relational database system
- **TypeScript**: Typed superset of JavaScript that compiles to plain JavaScript
- **JWT**: JSON Web Tokens for secure authentication
- **Argon2**: Advanced password hashing algorithm

## Getting Started

### Prerequisites

- **Node.js** (v16.13.1 or higher)
- **npm** (v8.1.2 or higher)
- **PostgreSQL** (v14.1 or higher)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/talha4t/e-commerce-backend.git
   cd e-commerce-backend
   ```
----
2. **Install dependencies:**  
  ```bash
   npm install
   ```

---
3. **Set up environment variables:**  
Create a `.env` file in the root directory and add your PostgreSQL database credentials:
```bash
  DATABASE_URL=postgresql://username:password@localhost:5432/dbname?schema=public  
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=3600
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=86400
```
---
4. **Set up the database:**  
Run the following command to apply Prisma migrations and set up the database schema:
```bash
    npx prisma migrate dev
```
---
5. **Start the server:**  
```bash
    npm run start:dev
```
