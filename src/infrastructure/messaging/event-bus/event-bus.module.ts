import { Module } from '@nestjs/common';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { EventBusService } from './event-bus.service';

@Module({
  imports: [RabbitMQModule],
  providers: [EventBusService],
  exports: [EventBusService],
})
export class EventBusModule {}
