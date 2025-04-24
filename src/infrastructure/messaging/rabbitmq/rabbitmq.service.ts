import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    console.log('RabbitMQService initialized (mock)');
  }

  async onModuleDestroy() {
    console.log('RabbitMQService destroyed (mock)');
  }

  async publishMessage(exchange: string, routingKey: string, message: any): Promise<boolean> {
    console.log(`[MOCK] Publishing message to ${exchange}.${routingKey}:`, message);

    return true;
  }

  async subscribe(
    exchange: string,
    routingKey: string,
    queue: string,
    _callback: (message: any) => void,
  ): Promise<void> {
    console.log(`[MOCK] Subscribed to ${exchange}.${routingKey} via queue ${queue}`);
  }
}
