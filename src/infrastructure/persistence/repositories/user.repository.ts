import { Injectable, Logger } from '@nestjs/common';
import { IUserRepository } from '../../../domain/user/repositories/user-repository.interface';
import { User } from '../../../domain/user/entities/user.entity';
import { Email } from '../../../domain/user/value-objects/email.vo';
import { UserId } from '../../../domain/user/value-objects/user-id.vo';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(private prisma: PrismaService) {}

  async findById(id: UserId): Promise<User | null> {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { id: id.value },
      });

      if (!userData) return null;

      return this.mapToDomain(userData);
    } catch (error) {
      this.logger.error(`Error finding user by ID: ${error.message}`);
      return null;
    }
  }

  async findByEmail(email: Email): Promise<User | null> {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { email: email.value },
      });

      if (!userData) return null;

      return this.mapToDomain(userData);
    } catch (error) {
      this.logger.error(`Error finding user by email: ${error.message}`);
      return null;
    }
  }

  async save(user: User): Promise<void> {
    try {
      await this.prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email.value,
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
          updatedAt: user.updatedAt,
        },
        create: {
          id: user.id,
          email: user.email.value,
          firstName: user.firstName,
          lastName: user.lastName,
          password: user.password,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      this.logger.error(`Error saving user: ${error.message}`);
      throw new Error(`Failed to save user: ${error.message}`);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany();
      return users.map((user) => this.mapToDomain(user));
    } catch (error) {
      this.logger.error(`Error finding all users: ${error.message}`);
      return [];
    }
  }

  async delete(id: UserId): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id: id.value },
      });
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  private mapToDomain(userData: any): User {
    return User.create(
      {
        email: Email.create(userData.email),
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      userData.id,
    );
  }
}