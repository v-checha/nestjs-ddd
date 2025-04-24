import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListUsersQuery } from './list-users.query';
import { UserDto } from '../../dtos/user.dto';
import { IUserRepository } from '../../../../domain/user/repositories/user-repository.interface';
import { UserMapper } from '../../mappers/user.mapper';
import { Inject } from '@nestjs/common';

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery, UserDto[]> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(_: ListUsersQuery): Promise<UserDto[]> {
    const users = await this.userRepository.findAll();
    return this.userMapper.toDtoList(users);
  }
}
