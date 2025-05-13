import { Module } from '@nestjs/common';
import { ChatApplicationModule } from '@application/chat/application.module';
import { ChatDomainModule } from '@domain/chat/domain.module';

@Module({
  imports: [ChatApplicationModule, ChatDomainModule],
  exports: [ChatApplicationModule, ChatDomainModule],
})
export class ChatModule {}