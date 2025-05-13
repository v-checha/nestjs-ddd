export interface PrismaUserModel {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  isVerified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userRoles?: PrismaUserRoleModel[];
  refreshTokens?: PrismaRefreshTokenModel[];
  verificationTokens?: PrismaVerificationTokenModel[];
}

export interface PrismaPermissionModel {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
  rolePermissions?: PrismaRolePermissionModel[];
}

export interface PrismaRoleModel {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  userRoles?: PrismaUserRoleModel[];
  rolePermissions?: PrismaRolePermissionModel[];
}

export interface PrismaUserRoleModel {
  userId: string;
  roleId: string;
  assignedAt: Date;
  user?: PrismaUserModel;
  role?: PrismaRoleModel;
}

export interface PrismaRolePermissionModel {
  roleId: string;
  permissionId: string;
  assignedAt: Date;
  role?: PrismaRoleModel;
  permission?: PrismaPermissionModel;
}

export interface PrismaRefreshTokenModel {
  id: string;
  token: string;
  userId: string;
  user?: PrismaUserModel;
  issuedAt: Date;
  expiresAt: Date;
  device: string | null;
  ipAddress: string | null;
  isRevoked: boolean;
}

export interface PrismaVerificationTokenModel {
  id: string;
  token: string;
  userId: string;
  user?: PrismaUserModel;
  type: string;
  issuedAt: Date;
  expiresAt: Date;
  isUsed: boolean;
}

export interface PrismaMessageModel {
  id: string;
  content: string;
  senderId: string;
  sender?: PrismaUserModel;
  chatId: string;
  privateChatId: string | null;
  groupChatId: string | null;
  createdAt: Date;
  updatedAt: Date;
  messageReadStatuses?: PrismaMessageReadStatusModel[];
}

export interface PrismaMessageReadStatusModel {
  id: string;
  messageId: string;
  message?: PrismaMessageModel;
  userId: string;
  user?: PrismaUserModel;
  readAt: Date;
}

export interface PrismaPrivateChatModel {
  id: string;
  participants?: PrismaUserModel[];
  messages?: PrismaMessageModel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PrismaGroupChatModel {
  id: string;
  name: string;
  creatorId: string;
  creator?: PrismaUserModel;
  participants?: PrismaUserModel[];
  messages?: PrismaMessageModel[];
  createdAt: Date;
  updatedAt: Date;
}
