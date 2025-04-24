export interface ICommandBus {
  execute<T>(command: object): Promise<T>;
}

export interface IQueryBus {
  execute<T>(query: object): Promise<T>;
}

export interface IEventBus {
  publish(events: object[]): Promise<void>;
}

export interface ICommandHandler<TCommand, TResult> {
  execute(command: TCommand): Promise<TResult>;
}

export interface IQueryHandler<TQuery, TResult> {
  execute(query: TQuery): Promise<TResult>;
}

export interface IEventHandler<TEvent> {
  handle(event: TEvent): Promise<void>;
}
