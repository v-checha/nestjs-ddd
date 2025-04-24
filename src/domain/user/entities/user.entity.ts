import { AggregateRoot } from '../../common/base/aggregate-root';
import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';
import { UserCreatedEvent } from '../events/user-created.event';
import { Role } from './role.entity';

interface UserProps {
  email: Email;
  firstName: string;
  lastName: string;
  password: string;
  roles: Role[];
  isVerified?: boolean;
  lastLogin?: Date;
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

  get roles(): Role[] {
    return this.props.roles;
  }

  get isVerified(): boolean {
    return this.props.isVerified ?? false;
  }

  get lastLogin(): Date | undefined {
    return this.props.lastLogin;
  }

  public static create(props: UserProps, id?: string): User {
    const user = new User(
      {
        ...props,
        roles: props.roles || [],
        isVerified: props.isVerified ?? false,
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

  public assignRole(role: Role): void {
    if (!this.hasRole(role.id)) {
      this.props.roles.push(role);
      this.props.updatedAt = new Date();
    }
  }

  public removeRole(roleId: string): void {
    this.props.roles = this.props.roles.filter((role) => role.id !== roleId);
    this.props.updatedAt = new Date();
  }

  public hasRole(roleId: string): boolean {
    return this.props.roles.some((role) => role.id === roleId);
  }

  public hasPermission(permissionId: string): boolean {
    return this.props.roles.some(role => 
      role.permissions.some(permission => permission.id === permissionId)
    );
  }

  public verify(): void {
    this.props.isVerified = true;
    this.props.updatedAt = new Date();
  }

  public updateLoginTimestamp(): void {
    this.props.lastLogin = new Date();
    this.props.updatedAt = new Date();
  }
}
