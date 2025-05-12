import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@frameworks/nest/guards/jwt-auth.guard';
import { PermissionsGuard } from '@frameworks/nest/guards/permissions.guard';
import {
  RequirePermissions,
  createPermissionString,
} from '@frameworks/nest/decorators/permissions.decorator';
import { ResourceType } from '@domain/user/value-objects/resource.vo';
import { ActionType } from '@domain/user/value-objects/permission-action.vo';
import { User } from '@frameworks/nest/decorators/user.decorator';
import { UserDto } from '@application/user/dtos/user.dto';
import { CreatePrivateChatCommand } from '@application/chat/commands/create-private-chat/create-private-chat.command';
import { CreateGroupChatCommand } from '@application/chat/commands/create-group-chat/create-group-chat.command';
import { GetUserChatsQuery } from '@application/chat/queries/get-user-chats/get-user-chats.query';
import { GetChatDetailsQuery } from '@application/chat/queries/get-chat-details/get-chat-details.query';
import { GetChatMessagesQuery } from '@application/chat/queries/get-chat-messages/get-chat-messages.query';
import { CreatePrivateChatRequest } from '../dtos/request/create-private-chat.request';
import { CreateGroupChatRequest } from '../dtos/request/create-group-chat.request';
import { ApiResponse, Meta } from '../dtos/response/api-response';
import {
  ChatListResponse,
  PrivateChatResponse,
  GroupChatResponse,
} from '../dtos/response/chat.response';
import { ChatMessagesResponse } from '../dtos/response/message.response';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('chats')
export class ChatController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('private')
  @RequirePermissions(createPermissionString(ResourceType.CHAT, ActionType.CREATE))
  @ApiOperation({ summary: 'Create a private chat' })
  @SwaggerResponse({ status: 201, type: PrivateChatResponse })
  async createPrivateChat(
    @User() user: UserDto,
    @Body() createChatDto: CreatePrivateChatRequest,
  ): Promise<ApiResponse<PrivateChatResponse>> {
    const command = new CreatePrivateChatCommand(user.id, createChatDto.participantId);

    const result = await this.commandBus.execute(command);

    return ApiResponse.success(
      result as PrivateChatResponse,
      new Meta({ message: 'Private chat created successfully' }),
    );
  }

  @Post('group')
  @RequirePermissions(createPermissionString(ResourceType.CHAT, ActionType.CREATE))
  @ApiOperation({ summary: 'Create a group chat' })
  @SwaggerResponse({ status: 201, type: GroupChatResponse })
  async createGroupChat(
    @User() user: UserDto,
    @Body() createGroupDto: CreateGroupChatRequest,
  ): Promise<ApiResponse<GroupChatResponse>> {
    const command = new CreateGroupChatCommand(
      user.id,
      createGroupDto.name,
      createGroupDto.participantIds,
    );

    const result = await this.commandBus.execute(command);

    return ApiResponse.success(
      result as GroupChatResponse,
      new Meta({ message: 'Group chat created successfully' }),
    );
  }

  @Get()
  @RequirePermissions(createPermissionString(ResourceType.CHAT, ActionType.READ))
  @ApiOperation({ summary: 'Get all chats for the current user' })
  @SwaggerResponse({ status: 200, type: ChatListResponse })
  async getUserChats(@User() user: UserDto): Promise<ApiResponse<ChatListResponse>> {
    const query = new GetUserChatsQuery(user.id);
    const result = await this.queryBus.execute(query);

    return ApiResponse.success(
      result as ChatListResponse,
      new Meta({ message: 'Chats retrieved successfully' }),
    );
  }

  @Get(':id')
  @RequirePermissions(createPermissionString(ResourceType.CHAT, ActionType.READ))
  @ApiOperation({ summary: 'Get details of a chat' })
  @ApiParam({ name: 'id', type: String, description: 'Chat ID' })
  @SwaggerResponse({ status: 200, type: GroupChatResponse })
  async getChatDetails(
    @User() user: UserDto,
    @Param('id') chatId: string,
  ): Promise<ApiResponse<PrivateChatResponse | GroupChatResponse>> {
    const query = new GetChatDetailsQuery(user.id, chatId);
    const result = await this.queryBus.execute(query);

    return ApiResponse.success(
      result as PrivateChatResponse | GroupChatResponse,
      new Meta({ message: 'Chat details retrieved successfully' }),
    );
  }

  @Get(':id/messages')
  @RequirePermissions(createPermissionString(ResourceType.CHAT, ActionType.READ))
  @ApiOperation({ summary: 'Get messages from a chat' })
  @ApiParam({ name: 'id', type: String, description: 'Chat ID' })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of messages to retrieve',
  })
  @ApiQuery({
    name: 'before',
    type: String,
    required: false,
    description: 'Get messages before this message ID',
  })
  @SwaggerResponse({ status: 200, type: ChatMessagesResponse })
  async getChatMessages(
    @User() user: UserDto,
    @Param('id') chatId: string,
    @Query('limit') limit?: number,
    @Query('before') beforeMessageId?: string,
  ): Promise<ApiResponse<ChatMessagesResponse>> {
    const query = new GetChatMessagesQuery(
      user.id,
      chatId,
      limit ? parseInt(limit.toString(), 10) : 20,
      beforeMessageId,
    );

    const messages = await this.queryBus.execute(query);

    return ApiResponse.success(
      { messages } as ChatMessagesResponse,
      new Meta({ message: 'Chat messages retrieved successfully' }),
    );
  }
}
