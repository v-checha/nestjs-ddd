import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateGroupChatCommand } from './create-group-chat.command';
import { GroupChat } from '@domain/chat/entities/group-chat.entity';
import { GroupChatRepositoryInterface } from '@domain/chat/repositories/group-chat-repository.interface';
import { ChatId } from '@domain/chat/value-objects/chat-id.vo';
import { ChatName } from '@domain/chat/value-objects/chat-name.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { UserRepository } from '@domain/user/repositories/user-repository.interface';
import { ApplicationException } from '../../../common/exceptions/application.exception';
import { Inject } from '@nestjs/common';
import { GroupChatMapper } from '../../mappers/group-chat.mapper';
import { GroupChatDto } from '../../dtos/group-chat.dto';
import { GroupChatCreatedEvent } from '@domain/chat/events/group-chat-created.event';

@CommandHandler(CreateGroupChatCommand)
export class CreateGroupChatHandler
  implements ICommandHandler<CreateGroupChatCommand, GroupChatDto>
{
  constructor(
    @Inject('GroupChatRepositoryInterface')
    private readonly groupChatRepository: GroupChatRepositoryInterface,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly groupChatMapper: GroupChatMapper,
  ) {}

  async execute(command: CreateGroupChatCommand): Promise<GroupChatDto> {
    const creatorId = UserId.create(command.creatorId);
    const chatName = ChatName.create(command.name);

    // Ensure creator exists
    const creator = await this.userRepository.findById(creatorId);
    if (!creator) {
      throw new ApplicationException('Creator user not found');
    }

    // Validate participants
    const participantUserIds: UserId[] = [];

    // Ensure unique IDs
    const uniqueParticipantIds = [...new Set(command.participantIds)];

    for (const participantId of uniqueParticipantIds) {
      // Skip creator if included in participants
      if (participantId === command.creatorId) {
        continue;
      }

      const userId = UserId.create(participantId);
      const participant = await this.userRepository.findById(userId);

      if (!participant) {
        throw new ApplicationException(`Participant user with ID ${participantId} not found`);
      }

      participantUserIds.push(userId);
    }

    // Create new group chat
    const groupChat = GroupChat.create(
      chatName,
      creatorId,
      participantUserIds.map(userId => ({ userId })),
    );

    // Add domain event for chat creation
    groupChat.addDomainEvent(
      new GroupChatCreatedEvent(
        ChatId.create(groupChat.id),
        chatName.value,
        creatorId,
        participantUserIds,
        new Date(),
      ),
    );

    await this.groupChatRepository.save(groupChat);

    return this.groupChatMapper.toDto(groupChat);
  }
}
