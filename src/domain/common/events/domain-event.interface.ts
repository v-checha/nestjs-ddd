export interface IDomainEvent {
  readonly eventName: string;
  readonly eventDate: Date;
}
