import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from './get-user.query';
import { UserDto } from '../../dtos/user.dto';
import { UserRepository } from '@domain/user/repositories/user-repository.interface';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { UserMapper } from '../../mappers/user.mapper';
import { Inject } from '@nestjs/common';
import { UserNotFoundException } from '../../../common/exceptions/application.exception';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, UserDto> {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(query: GetUserQuery): Promise<UserDto> {
    const userId = UserId.create(query.id);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException(query.id);
    }

    return this.userMapper.toDto(user);
  }
}
