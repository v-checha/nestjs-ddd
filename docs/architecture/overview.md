# Architecture Overview

This document provides an overview of the architecture used in this NestJS Domain-Driven Design (DDD) application.

## Architecture Layers

The application follows a layered architecture based on DDD principles:

### 1. Domain Layer

The domain layer is the core of the application and contains the business logic. It's completely isolated from other concerns like infrastructure, persistence, or UI.

Components:
- **Entities**: Core business objects (e.g., User, Role, Permission)
- **Value Objects**: Immutable objects with no identity (e.g., Email, ResourceType)
- **Domain Events**: Events that occur within the domain
- **Aggregates**: Clusters of entities and value objects treated as a single unit
- **Repository Interfaces**: Contracts for data access
- **Domain Services**: Services that perform operations that don't naturally fit within an entity or value object

### 2. Application Layer

The application layer orchestrates the use of domain objects to perform specific application tasks.

Components:
- **Commands/Handlers**: Execute operations that change state (write operations)
- **Queries/Handlers**: Retrieve and return data (read operations)
- **DTOs**: Data Transfer Objects for moving data between layers
- **Mappers**: Objects that transform domain objects to DTOs and vice versa
- **Application Services**: Coordinate the execution of application-specific logic

### 3. Infrastructure Layer

The infrastructure layer provides implementations for interfaces defined in the domain layer, as well as technical capabilities.

Components:
- **Repository Implementations**: Concrete implementations of repository interfaces
- **ORM Adapters**: Prisma and other ORM configurations
- **External Services**: Integrations with third-party services
- **Persistence**: Database-related code
- **Caching**: Caching mechanisms
- **Messaging**: Message brokers and queues

### 4. Presentation Layer

The presentation layer handles HTTP requests and presents data to clients.

Components:
- **Controllers**: Handle HTTP requests
- **Request/Response Models**: Data structures for HTTP communication
- **Middleware**: Request processing pipelines
- **API Documentation**: Swagger/OpenAPI specifications

### 5. Frameworks Layer

The frameworks layer contains framework-specific configurations.

Components:
- **Module Definitions**: NestJS module configurations
- **Dependency Injection Setup**: Provider configurations
- **Bootstrapping**: Application startup code
- **Middleware Registration**: Global middleware setup

## Key Design Patterns

The architecture employs several design patterns:

1. **Repository Pattern**: Abstracts data access operations
2. **CQRS Pattern**: Separates read and write operations
3. **Dependency Injection**: Manages dependencies between classes
4. **Factory Pattern**: Creates complex objects
5. **Value Objects**: Encapsulates validation and behavior
6. **Command Pattern**: Encapsulates a request as an object

## Communication Flow

1. HTTP Request → Controller
2. Controller → Application Layer (Command/Query)
3. Application Layer → Domain Layer
4. Domain Layer → Repository Interface
5. Repository Implementation → Database
6. Results flow back through the layers

## Dependency Rule

The architecture follows the Dependency Rule: outer layers can depend on inner layers, but inner layers cannot depend on outer layers. This ensures that the domain layer remains pure and isolated from technical concerns.

![DDD Architecture Diagram](../assets/ddd-architecture.png)