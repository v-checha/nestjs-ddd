# NestJS DDD Architecture Example

This project demonstrates a Domain-Driven Design (DDD) architecture implementation using NestJS, following clean architecture principles.

## Documentation

### Architecture

- [Architecture Overview](docs/architecture/overview.md)

### Domain Layer

- [Entities](docs/entities/overview.md)
- [Value Objects](docs/value-objects/overview.md)
- [Repositories](docs/repositories/overview.md)

### Application Layer

- [CQRS Pattern](docs/application/cqrs.md)

### Infrastructure Layer

- [Exception Handling](docs/infrastructure/exceptions.md)

### API and Security

- [REST API Documentation](docs/api/rest-api.md)
- [JWT Authentication](docs/authentication/jwt.md)

## Project Structure

The application is organized into several layers:

- **Domain Layer**: Contains the business logic and rules of the application. This includes entities, value objects, domain services, repository interfaces, and domain events.

- **Application Layer**: Contains the application-specific logic that orchestrates the domain objects to perform tasks. This includes use cases (commands and queries), DTOs, and mappers.

- **Infrastructure Layer**: Provides implementations for interfaces defined in the domain layer, such as repositories, and contains adapters to external services.

- **Presentation Layer**: Handles HTTP requests and presents data to clients, using controllers and adapters.

- **Frameworks Layer**: Contains framework-specific configurations and bootstrapping code.

## Key Features

- Clean Architecture / Domain-Driven Design
- CQRS Pattern with Commands and Queries
- Event-driven architecture using domain events
- Value Objects for encapsulation and validation
- Repository pattern for data access
- Dependency Injection for loose coupling
- JWT Authentication
- Swagger API Documentation
- Error handling middleware
- Validation using class-validator
- Logging and monitoring

## Getting Started

### Prerequisites

- Node.js (>= 16.x)
- npm or yarn
- PostgreSQL

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/nestjs-ddd.git
cd nestjs-ddd
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:

```
NODE_ENV=development
PORT=3000
API_PREFIX=api

DATABASE_URL=postgresql://username:password@localhost:5432/nestjs_ddd

JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=1d
```

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Run database migrations:

```bash
npx prisma migrate dev
```

### Running the Application

```bash
npm run start:dev
```

The application will be available at `http://localhost:3000/api`
Swagger documentation will be available at `http://localhost:3000/api/docs`

## Development

### Code Style

This project uses ESLint and Prettier for code formatting and linting:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint --fix

# Format code with Prettier
npm run format
```

### Database Seeding

To seed the database with initial data:

```bash
npm run db:seed
```

## License

This project is licensed under the MIT License.