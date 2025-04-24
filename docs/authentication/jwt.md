# JWT Authentication

This document describes the JWT (JSON Web Token) authentication implementation in the application.

## Overview

JWT authentication is implemented using NestJS's built-in authentication features with Passport.js. This approach provides a secure, stateless authentication mechanism for the API.

## JWT Structure

JWTs consist of three parts:
1. **Header**: Contains metadata about the token (type, algorithm)
2. **Payload**: Contains claims (user information)
3. **Signature**: Ensures the token hasn't been tampered with

In this application, the JWT payload includes:
- `sub`: Subject (user ID)
- `email`: User's email
- `roles`: Array of role names
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

## Authentication Flow

1. **Registration**: User registers with email/password
2. **Login**: User provides credentials and receives access and refresh tokens
3. **Access**: Protected endpoints require a valid JWT in the Authorization header
4. **Refresh**: When the access token expires, the refresh token can be used to get a new access token
5. **Logout**: Refresh token is invalidated

## Implementation

### Module Configuration

```typescript
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
    }),
    // Other imports...
  ],
  providers: [
    AuthService,
    JwtStrategy,
    // Other providers...
  ],
  controllers: [AuthController],
})
export class AuthModule {}
```

### JWT Strategy

The JWT strategy extracts and validates the JWT from the request:

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findById(UserId.create(payload.sub));
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
  }
}
```

### Auth Service

The auth service handles token generation and validation:

```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('RefreshTokenRepository')
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(Email.create(email));
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email.value,
      roles: user.roles.map(role => role.name),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken();
    
    // Save refresh token
    await this.refreshTokenRepository.save(
      RefreshToken.create({
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  // Additional methods...
}
```

### Auth Controller

The auth controller provides endpoints for authentication:

```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  async login(@Body() request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const command = new LoginCommand(request.email, request.password);
    const result = await this.commandBus.execute(command);
    return ApiResponse.success(result);
  }

  @Post('refresh-token')
  async refreshToken(@Body() request: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> {
    const command = new RefreshTokenCommand(request.refreshToken);
    const result = await this.commandBus.execute(command);
    return ApiResponse.success(result);
  }

  @Post('register')
  async register(@Body() request: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const command = new RegisterCommand(
      request.email,
      request.password,
      request.firstName,
      request.lastName
    );
    const result = await this.commandBus.execute(command);
    return ApiResponse.success(result);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@User() user: JwtUserPayload, @Body() request: LogoutRequest): Promise<ApiResponse<void>> {
    const command = new LogoutCommand(user.id, request.refreshToken);
    await this.commandBus.execute(command);
    return ApiResponse.success();
  }
}
```

## Guards

Guards protect endpoints by requiring authentication:

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

## Permissions Guard

The permissions guard extends authentication to check specific permissions:

```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    // Get the user entity with roles and permissions
    const userEntity = await this.userRepository.findById(UserId.create(user.id));
    if (!userEntity) {
      return false;
    }

    // Check if the user has super_admin role - they have access to everything
    const isSuperAdmin = userEntity.roles.some(role => role.type.isSuperAdmin());
    if (isSuperAdmin) {
      return true;
    }

    // Check if the user has all required permissions
    return requiredPermissions.every(permission => {
      const [resource, action] = permission.split(':');
      return userEntity.hasPermission(resource, action);
    });
  }
}
```

## Decorators

Custom decorators make it easy to use authentication features:

```typescript
// Public endpoint decorator
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Required permissions decorator
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// Current user decorator
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

## Security Considerations

1. **Token Storage**: Refresh tokens are stored in the database
2. **Password Security**: Passwords are hashed using bcrypt
3. **Token Expiration**: Access tokens have short lifetimes (1 hour by default)
4. **HTTPS**: All API endpoints should be served over HTTPS in production
5. **CSRF Protection**: Implemented for non-JWT endpoints
6. **Rate Limiting**: API endpoints are rate-limited to prevent abuse

## Configuration

Authentication settings are configured through environment variables:

```
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

## Testing

Authentication can be tested with tools like Postman or curl:

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Access protected endpoint
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer <access-token>"
```