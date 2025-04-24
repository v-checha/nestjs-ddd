import { AggregateRoot } from '../../common/base/aggregate-root';
import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';
import { UserCreatedEvent } from '../events/user-created.event';

interface UserProps {
  email: Email;
  firstName: string;
  lastName: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  get userId(): UserId {
    return UserId.create(this.id);
  }

  get email(): Email {
    return this.props.email;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  get password(): string {
    return this.props.password;
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  public static create(props: UserProps, id?: string): User {
    const user = new User(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );

    // Add domain event for new user
    if (!id) {
      user.addDomainEvent(new UserCreatedEvent(user));
    }

    return user;
  }

  public updateName(firstName: string, lastName: string): void {
    this.props.firstName = firstName;
    this.props.lastName = lastName;
    this.props.updatedAt = new Date();
  }

  public updateEmail(email: Email): void {
    this.props.email = email;
    this.props.updatedAt = new Date();
  }

  public updatePassword(password: string): void {
    this.props.password = password;
    this.props.updatedAt = new Date();
  }
}
