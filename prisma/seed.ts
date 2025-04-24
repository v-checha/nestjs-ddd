import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Export for simulation script to call
export { main };

// Define constants
const SALT_ROUNDS = 10;

// Resource and action types to match our enums
enum Resource {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  PROFILE = 'profile',
  POST = 'post',
  COMMENT = 'comment',
  CATEGORY = 'category',
  TAG = 'tag',
  MEDIA = 'media',
  SETTINGS = 'settings',
  ANALYTICS = 'analytics',
  AUDIT = 'audit',
}

enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

enum RoleType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest',
}

// Permission and role definitions
const roleDefinitions = [
  {
    id: uuidv4(),
    name: 'Super Administrator',
    description: 'Complete access to all system resources and functionalities',
    type: RoleType.SUPER_ADMIN,
    isDefault: false,
  },
  {
    id: uuidv4(),
    name: 'Administrator',
    description: 'Administrative access to system resources',
    type: RoleType.ADMIN,
    isDefault: false,
  },
  {
    id: uuidv4(),
    name: 'Moderator',
    description: 'Manage and moderate user generated content',
    type: RoleType.MODERATOR,
    isDefault: false,
  },
  {
    id: uuidv4(),
    name: 'User',
    description: 'Standard user access',
    type: RoleType.USER,
    isDefault: true,
  },
  {
    id: uuidv4(),
    name: 'Guest',
    description: 'Limited access to public resources',
    type: RoleType.GUEST,
    isDefault: false,
  },
];

// Create all possible permissions
function generatePermissions() {
  const permissions = [];
  
  for (const resource of Object.values(Resource)) {
    for (const action of Object.values(PermissionAction)) {
      const id = uuidv4();
      const name = `${resource}:${action}`;
      const description = `Permission to ${action} ${resource}`;
      
      permissions.push({
        id,
        name,
        description,
        resource,
        action,
      });
    }
  }
  
  return permissions;
}

// Define default users
const defaultUsers = [
  {
    id: uuidv4(),
    email: 'admin@example.com',
    firstName: 'System',
    lastName: 'Administrator',
    password: 'Admin123!',
    isVerified: true,
    roleName: 'Super Administrator', // Will be linked to role
  },
  {
    id: uuidv4(),
    email: 'user@example.com',
    firstName: 'Regular',
    lastName: 'User',
    password: 'User123!',
    isVerified: true,
    roleName: 'User', // Will be linked to role
  },
];

// Define role permission assignments
// Key is role name, value is array of resources the role has full access to
const rolePermissionMap = {
  'Super Administrator': Object.values(Resource),
  'Administrator': [
    Resource.USER, Resource.ROLE, Resource.PERMISSION, 
    Resource.SETTINGS, Resource.ANALYTICS, Resource.AUDIT
  ],
  'Moderator': [
    Resource.POST, Resource.COMMENT, Resource.MEDIA,
    Resource.CATEGORY, Resource.TAG
  ],
  'User': [
    Resource.PROFILE
  ],
  'Guest': [] // No permissions
};

async function main() {
  console.log('Starting database seed...');
  
  // Generate all permissions
  const permissions = generatePermissions();
  
  // Create permissions in database
  console.log(`Creating ${permissions.length} permissions...`);
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission,
    });
  }
  
  // Create roles in database
  console.log(`Creating ${roleDefinitions.length} roles...`);
  for (const role of roleDefinitions) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: role,
    });
  }

  // Assign permissions to roles
  console.log('Assigning permissions to roles...');
  for (const [roleName, resources] of Object.entries(rolePermissionMap)) {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      console.error(`Role "${roleName}" not found.`);
      continue;
    }

    for (const resource of resources) {
      // For each resource, get all permissions
      const resourcePermissions = await prisma.permission.findMany({
        where: { resource },
      });

      // Assign each permission to the role
      for (const permission of resourcePermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  // Create users
  console.log(`Creating ${defaultUsers.length} users...`);
  for (const user of defaultUsers) {
    // Hash password
    const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
    
    // Get associated role
    const role = await prisma.role.findUnique({
      where: { name: user.roleName },
    });
    
    if (!role) {
      console.error(`Role "${user.roleName}" not found for user ${user.email}.`);
      continue;
    }
    
    // Create user
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        password: hashedPassword,
        isVerified: user.isVerified,
      },
      create: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: hashedPassword,
        isVerified: user.isVerified,
      },
    });
    
    // Assign role to user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: createdUser.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId: createdUser.id,
        roleId: role.id,
      },
    });
  }
  
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });