import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { DomainEvent } from '../../../domain/common/events/domain-event.interface';

@Injectable()
export class EventBusService {
  private readonly EXCHANGE = 'domain_events';

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.rabbitMQService.publishMessage(
        this.EXCHANGE,
        event.eventName,
        event,
      );
    }
  }

  async subscribe(
    eventName: string,
    callback: (event: any) => Promise<void>,
  ): Promise<void> {
    await this.rabbitMQService.subscribe(
      this.EXCHANGE,
      eventName,
      `queue_${eventName}`,
      async (event) => {
        await callback(event);
      },
    );
  }
}
