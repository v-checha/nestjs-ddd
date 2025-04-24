import { ApiProperty } from '@nestjs/swagger';

export class Meta {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
    required: false,
  })
  currentPage?: number;

  @ApiProperty({
    description: 'Total pages available',
    example: 5,
    required: false,
  })
  totalPages?: number;

  @ApiProperty({
    description: 'Total count of items',
    example: 100,
    required: false,
  })
  totalCount?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    required: false,
  })
  pageSize?: number;

  @ApiProperty({
    description: 'Request timestamp',
    example: new Date().toISOString(),
    required: false,
  })
  timestamp?: string;

  @ApiProperty({
    description: 'Additional message for the response',
    example: 'Operation completed successfully',
    required: false,
  })
  message?: string;

  constructor(partial?: Partial<Meta>) {
    if (partial) {
      Object.assign(this, partial);
    } else {
      this.timestamp = new Date().toISOString();
    }
  }
}

export class Links {
  @ApiProperty({
    description: 'Link to the current resource',
    example: '/api/users/123',
    required: false,
  })
  self?: string;

  @ApiProperty({
    description: 'Link to the first page',
    example: '/api/users?page=1',
    required: false,
  })
  first?: string;

  @ApiProperty({
    description: 'Link to the last page',
    example: '/api/users?page=5',
    required: false,
  })
  last?: string;

  @ApiProperty({
    description: 'Link to the previous page',
    example: '/api/users?page=2',
    required: false,
  })
  prev?: string;

  @ApiProperty({
    description: 'Link to the next page',
    example: '/api/users?page=4',
    required: false,
  })
  next?: string;

  constructor(partial?: Partial<Links>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}

export class ErrorDetail {
  @ApiProperty({
    description: 'Error code',
    example: 'VALIDATION_ERROR',
  })
  code: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid email format',
  })
  message: string;

  @ApiProperty({
    description: 'Field path that caused the error',
    example: 'email',
    required: false,
  })
  field?: string;

  constructor(code: string, message: string, field?: string) {
    this.code = code;
    this.message = message;
    this.field = field;
  }
}

export class ApiResponse<T> {
  @ApiProperty({
    description: 'Response data',
    required: false,
    oneOf: [
      { type: 'object' },
      { type: 'array', items: { type: 'object' } },
      { type: 'string' },
      { type: 'number' },
      { type: 'boolean' },
      { type: 'null' },
    ],
  })
  data?: T;

  @ApiProperty({
    description: 'Response metadata including timestamp, pagination info, and messages',
    required: false,
    type: Meta,
  })
  meta?: Meta;

  @ApiProperty({
    description: 'Hypermedia links for navigation and resource relationships',
    required: false,
    type: Links,
  })
  links?: Links;

  @ApiProperty({
    description: 'Error details when response represents an error',
    required: false,
    type: [ErrorDetail],
  })
  errors?: ErrorDetail[];

  constructor(data?: T, meta?: Meta, links?: Links, errors?: ErrorDetail[]) {
    if (data !== undefined) {
      this.data = data;
    }

    if (meta) {
      this.meta = meta;
    } else {
      this.meta = new Meta();
    }

    if (links) {
      this.links = links;
    }

    if (errors && errors.length > 0) {
      this.errors = errors;
    }
  }

  static success<T>(data: T, meta?: Meta, links?: Links): ApiResponse<T> {
    return new ApiResponse<T>(data, meta, links);
  }

  static error(errors: ErrorDetail[] | string[] | string, meta?: Meta): ApiResponse<null> {
    let errorDetails: ErrorDetail[];

    if (typeof errors === 'string') {
      errorDetails = [new ErrorDetail('ERROR', errors)];
    } else if (Array.isArray(errors) && typeof errors[0] === 'string') {
      errorDetails = (errors as string[]).map(msg => new ErrorDetail('ERROR', msg));
    } else {
      errorDetails = errors as ErrorDetail[];
    }

    return new ApiResponse<null>(undefined, meta, undefined, errorDetails);
  }

  static paginated<T>(
    data: T[],
    currentPage: number,
    totalPages: number,
    totalCount: number,
    pageSize: number,
    baseUrl: string,
  ): ApiResponse<T[]> {
    const meta = new Meta({
      currentPage,
      totalPages,
      totalCount,
      pageSize,
      timestamp: new Date().toISOString(),
    });

    const links = new Links({
      self: `${baseUrl}?page=${currentPage}&limit=${pageSize}`,
    });

    if (currentPage > 1) {
      links.prev = `${baseUrl}?page=${currentPage - 1}&limit=${pageSize}`;
    }

    if (currentPage < totalPages) {
      links.next = `${baseUrl}?page=${currentPage + 1}&limit=${pageSize}`;
    }

    links.first = `${baseUrl}?page=1&limit=${pageSize}`;
    links.last = `${baseUrl}?page=${totalPages}&limit=${pageSize}`;

    return new ApiResponse<T[]>(data, meta, links);
  }
}
