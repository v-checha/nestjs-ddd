import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePrivateChatCommand } from './create-private-chat.command';
import { PrivateChat } from '@domain/chat/entities/private-chat.entity';
import { PrivateChatRepositoryInterface } from '@domain/chat/repositories/private-chat-repository.interface';
import { ChatId } from '@domain/chat/value-objects/chat-id.vo';
import { UserId } from '@domain/user/value-objects/user-id.vo';
import { UserRepository } from '@domain/user/repositories/user-repository.interface';
import { ApplicationException } from '../../../common/exceptions/application.exception';
import { Inject } from '@nestjs/common';
import { PrivateChatMapper } from '../../mappers/private-chat.mapper';
import { PrivateChatDto } from '../../dtos/private-chat.dto';
import { PrivateChatCreatedEvent } from '@domain/chat/events/private-chat-created.event';

@CommandHandler(CreatePrivateChatCommand)
export class CreatePrivateChatHandler
  implements ICommandHandler<CreatePrivateChatCommand, PrivateChatDto>
{
  constructor(
    @Inject('PrivateChatRepositoryInterface')
    private readonly privateChatRepository: PrivateChatRepositoryInterface,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly privateChatMapper: PrivateChatMapper,
  ) {}

  async execute(command: CreatePrivateChatCommand): Promise<PrivateChatDto> {
    const initiatorId = UserId.create(command.initiatorId);
    const participantId = UserId.create(command.participantId);

    // Ensure both users exist
    const initiator = await this.userRepository.findById(initiatorId);
    if (!initiator) {
      throw new ApplicationException('Initiator user not found');
    }

    const participant = await this.userRepository.findById(participantId);
    if (!participant) {
      throw new ApplicationException('Participant user not found');
    }

    // Check if private chat already exists between these users
    const existingChat = await this.privateChatRepository.findByParticipants(
      initiatorId,
      participantId,
    );
    if (existingChat) {
      // If chat exists but is inactive, reactivate it
      if (!existingChat.areAllParticipantsActive()) {
        if (!existingChat.containsUser(initiatorId)) {
          existingChat.reactivateParticipant(initiatorId);
        }
        if (!existingChat.containsUser(participantId)) {
          existingChat.reactivateParticipant(participantId);
        }
        await this.privateChatRepository.save(existingChat);
      }

      return this.privateChatMapper.toDto(existingChat);
    }

    // Create new private chat
    const privateChat = PrivateChat.create([{ userId: initiatorId }, { userId: participantId }]);

    // Add domain event for chat creation
    privateChat.addDomainEvent(
      new PrivateChatCreatedEvent(
        ChatId.create(privateChat.id),
        [initiatorId, participantId],
        new Date(),
      ),
    );

    await this.privateChatRepository.save(privateChat);

    return this.privateChatMapper.toDto(privateChat);
  }
}
