# REST API Documentation

This document provides an overview of the REST API endpoints available in the application.

## API Structure

The API follows RESTful principles and is organized around resources. All endpoints are prefixed with `/api`.

## Authentication

Most API endpoints require authentication via a JWT token. To authenticate:

1. Send a POST request to `/api/auth/login` with valid credentials
2. Include the returned access token in the `Authorization` header of subsequent requests:
   ```
   Authorization: Bearer your_access_token
   ```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    // Optional metadata (pagination, etc.)
  },
  "error": null
}
```

In case of an error:

```json
{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  }
}
```

## Pagination

Endpoints that return collections support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)

Paginated responses include metadata:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 47,
    "pageSize": 10
  },
  "error": null
}
```

## API Endpoints

### Authentication

#### Register User

```
POST /api/auth/register
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "meta": null,
  "error": null
}
```

#### Login

```
POST /api/auth/login
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "refresh_token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "meta": null,
  "error": null
}
```

#### Refresh Token

```
POST /api/auth/refresh-token
```

Request body:
```json
{
  "refreshToken": "refresh_token"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_refresh_token"
  },
  "meta": null,
  "error": null
}
```

#### Logout

```
POST /api/auth/logout
```

Request body:
```json
{
  "refreshToken": "refresh_token"
}
```

Response:
```json
{
  "success": true,
  "data": null,
  "meta": null,
  "error": null
}
```

### Users

#### Get Current User

```
GET /api/users/me
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": [
      {
        "id": "uuid",
        "name": "Admin",
        "type": "admin"
      }
    ]
  },
  "meta": null,
  "error": null
}
```

#### Get All Users

```
GET /api/users?page=1&limit=10
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user1@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    {
      "id": "uuid2",
      "email": "user2@example.com",
      "firstName": "Jane",
      "lastName": "Smith"
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 47,
    "pageSize": 10
  },
  "error": null
}
```

#### Get User by ID

```
GET /api/users/{id}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": [
      {
        "id": "uuid",
        "name": "Admin",
        "type": "admin"
      }
    ]
  },
  "meta": null,
  "error": null
}
```

#### Update User

```
PUT /api/users/{id}
```

Request body:
```json
{
  "firstName": "Updated",
  "lastName": "Name"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Updated",
    "lastName": "Name"
  },
  "meta": null,
  "error": null
}
```

#### Delete User

```
DELETE /api/users/{id}
```

Response:
```json
{
  "success": true,
  "data": null,
  "meta": null,
  "error": null
}
```

### Roles

#### Get All Roles

```
GET /api/roles?page=1&limit=10
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Admin",
      "description": "Administrator role",
      "type": "admin",
      "isDefault": false,
      "permissions": [
        {
          "id": "uuid",
          "name": "user:manage",
          "description": "Manage users"
        }
      ]
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 5,
    "pageSize": 10
  },
  "error": null
}
```

#### Get Role by ID

```
GET /api/roles/{id}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Admin",
    "description": "Administrator role",
    "type": "admin",
    "isDefault": false,
    "permissions": [
      {
        "id": "uuid",
        "name": "user:manage",
        "description": "Manage users"
      }
    ]
  },
  "meta": null,
  "error": null
}
```

#### Create Role

```
POST /api/roles
```

Request body:
```json
{
  "name": "Editor",
  "description": "Content editor role",
  "type": "editor",
  "isDefault": false,
  "permissionIds": ["uuid1", "uuid2"]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Editor",
    "description": "Content editor role",
    "type": "editor",
    "isDefault": false,
    "permissions": [
      {
        "id": "uuid1",
        "name": "content:create",
        "description": "Create content"
      },
      {
        "id": "uuid2",
        "name": "content:update",
        "description": "Update content"
      }
    ]
  },
  "meta": null,
  "error": null
}
```

#### Update Role

```
PUT /api/roles/{id}
```

Request body:
```json
{
  "name": "Updated Role",
  "description": "Updated description",
  "permissionIds": ["uuid1", "uuid2", "uuid3"]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Role",
    "description": "Updated description",
    "type": "editor",
    "isDefault": false,
    "permissions": [
      {
        "id": "uuid1",
        "name": "content:create",
        "description": "Create content"
      },
      {
        "id": "uuid2",
        "name": "content:update",
        "description": "Update content"
      },
      {
        "id": "uuid3",
        "name": "content:delete",
        "description": "Delete content"
      }
    ]
  },
  "meta": null,
  "error": null
}
```

#### Delete Role

```
DELETE /api/roles/{id}
```

Response:
```json
{
  "success": true,
  "data": null,
  "meta": null,
  "error": null
}
```

#### Assign Role to User

```
POST /api/roles/{roleId}/users
```

Request body:
```json
{
  "userId": "user_uuid"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "user_uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": [
      {
        "id": "uuid",
        "name": "Updated Role",
        "type": "editor"
      }
    ]
  },
  "meta": null,
  "error": null
}
```

#### Remove Role from User

```
DELETE /api/roles/{roleId}/users/{userId}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "user_uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": []
  },
  "meta": null,
  "error": null
}
```

### Permissions

#### Get All Permissions

```
GET /api/permissions?page=1&limit=10&resource=user
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "user:create",
      "description": "Create users",
      "resource": "user",
      "action": "create"
    },
    {
      "id": "uuid2",
      "name": "user:read",
      "description": "Read users",
      "resource": "user",
      "action": "read"
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 8,
    "pageSize": 10
  },
  "error": null
}
```

#### Get Permission by ID

```
GET /api/permissions/{id}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "user:create",
    "description": "Create users",
    "resource": "user",
    "action": "create"
  },
  "meta": null,
  "error": null
}
```

#### Create Permission

```
POST /api/permissions
```

Request body:
```json
{
  "name": "user:create",
  "description": "Create users",
  "resource": "user",
  "action": "create"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "user:create",
    "description": "Create users",
    "resource": "user",
    "action": "create"
  },
  "meta": null,
  "error": null
}
```

#### Update Permission

```
PUT /api/permissions/{id}
```

Request body:
```json
{
  "description": "Create new users in the system"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "user:create",
    "description": "Create new users in the system",
    "resource": "user",
    "action": "create"
  },
  "meta": null,
  "error": null
}
```

#### Delete Permission

```
DELETE /api/permissions/{id}
```

Response:
```json
{
  "success": true,
  "data": null,
  "meta": null,
  "error": null
}
```

## Error Codes

The API uses the following error codes:

- `UNAUTHORIZED`: Authentication is required or has failed
- `FORBIDDEN`: User doesn't have permission to access the resource
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `CONFLICT`: Resource already exists
- `INTERNAL_ERROR`: Server error

## API Versioning

API versioning is supported through content negotiation:

```
Accept: application/json; version=1
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse. The rate limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1620000000
```

## Swagger Documentation

Full API documentation is available at:
```
/api/docs
```