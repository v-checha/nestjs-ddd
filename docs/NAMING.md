# NAMING CONVENTIONS

## INTERFACE NAMING CONVENTIONS

### Domain Layer Interfaces

1. **Repository Interfaces**:
    - Use descriptive names without prefixes: `UserRepository`, `OrderRepository`
    - The implementation would be named: `UserRepositoryImpl` or better yet, with implementation details: `PrismaUserRepository`, `MongoUserRepository`

2. **Domain Services**:
    - Plain descriptive names: `OrderPricingService`, `PaymentService` (for interfaces)
    - Implementations: `DefaultOrderPricingService` or `StripePaymentService`

3. **Domain Events**:
    - Simple descriptive interface: `DomainEvent`

### Application Layer Interfaces

1. **Use Cases**:
    - `CreateUserUseCase`, `PlaceOrderUseCase`
    - Implementations: `CreateUserUseCaseImpl` or `DefaultCreateUserUseCase`

2. **Command/Query Handlers**:
    - `CommandHandler<T>`, `QueryHandler<T, R>`

3. **Application Services**:
    - `UserApplicationService`, `OrderApplicationService`

### Infrastructure Layer Interfaces

1. **External Services**:
    - `PaymentGateway`, `EmailService`, `FileStorage`
    - Implementations: `StripePaymentGateway`, `SendgridEmailService`

2. **Infrastructure Services**:
    - `TokenService`, `CacheService`, `Logger`
    - Implementations: `JwtTokenService`, `RedisCache`
