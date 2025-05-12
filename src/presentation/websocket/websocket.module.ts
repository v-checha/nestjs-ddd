import { Module } from '@nestjs/common';
import { ChatWebsocketModule } from './chat/chat.module';

@Module({
  imports: [ChatWebsocketModule],
  exports: [ChatWebsocketModule],
})
export class WebsocketModule {}
