import { User } from '../../../domain/user/entities/user.entity';
import { UserDto } from '../dtos/user.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserMapper {
  toDto(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.email = user.email.value;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }

  toDtoList(users: User[]): UserDto[] {
    return users.map((user) => this.toDto(user));
  }
}
