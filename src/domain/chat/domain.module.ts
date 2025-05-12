import { Module } from '@nestjs/common';
import { UserDomainModule } from '../user/domain.module';

@Module({
  imports: [UserDomainModule],
  providers: [],
  exports: [],
})
export class ChatDomainModule {}
