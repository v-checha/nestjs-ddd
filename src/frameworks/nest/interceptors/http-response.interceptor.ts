import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, Meta, Links } from '../../../presentation/rest/dtos/response/api-response';
import { Request } from 'express';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    const status = response.statusCode || HttpStatus.OK;

    // Get base URL for link generation
    const baseUrl = `${request.protocol}://${request.get('host')}${request.path}`;

    return next.handle().pipe(
      map(data => {
        // If data is already an ApiResponse instance, return it as is
        if (data instanceof ApiResponse) {
          return data;
        }

        // Handle arrays (potential pagination)
        if (Array.isArray(data)) {
          // Extract pagination parameters if present in query
          const page = parseInt(request.query.page as string) || 1;
          const limit = parseInt(request.query.limit as string) || data.length;

          // If not querying with pagination, just return
          if (!request.query.page && !request.query.limit) {
            return ApiResponse.success(data, new Meta(), new Links({ self: baseUrl }));
          }

          const totalCount = data.length;
          const totalPages = Math.ceil(totalCount / limit);

          // Slice data for pagination
          const paginatedData = data.slice((page - 1) * limit, page * limit);

          return ApiResponse.paginated(paginatedData, page, totalPages, totalCount, limit, baseUrl);
        }

        // Handle single objects
        return ApiResponse.success(data, new Meta(), new Links({ self: baseUrl }));
      }),
    );
  }
}
