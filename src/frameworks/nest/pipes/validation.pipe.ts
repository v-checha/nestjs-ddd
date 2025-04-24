import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

// Define type for validation errors
type ValidationConstraint = Record<string, string>;

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map(
        err =>
          `${err.property}: ${Object.values(err.constraints as ValidationConstraint).join(', ')}`,
      );

      throw new BadRequestException({
        message: 'Validation failed',
        errors: messages,
      });
    }

    return object;
  }

  private toValidate(metatype: abstract new (...args: any[]) => any): boolean {
    const types = [String, Boolean, Number, Array, Object];

    return !types.includes(metatype as any);
  }
}
