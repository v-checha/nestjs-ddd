import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '@frameworks/nest/modules/user.module';
import { AuthModule } from '@frameworks/nest/modules/auth.module';
import { ChatModule } from '@frameworks/nest/modules/chat.module';
import { RestModule } from '@presentation/rest/rest.module';
import { WebsocketModule } from '@presentation/websocket/websocket.module';
import { LoggingModule } from '@infrastructure/logging/logging.module';
import { PrismaModule } from '@infrastructure/persistence/prisma/prisma.module';
import appConfig from './infrastructure/config/app.config';
import databaseConfig from './infrastructure/config/database.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),

    // Infrastructure
    LoggingModule,
    PrismaModule,

    // Application & Domain (via framework modules)
    UserModule,
    AuthModule,
    ChatModule,

    // Presentation
    RestModule,
    WebsocketModule,
  ],
})
export class AppModule {}
