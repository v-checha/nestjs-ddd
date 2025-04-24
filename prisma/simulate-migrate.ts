import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Simulating migration...');
  
  // Add role type and isDefault columns
  try {
    await prisma.$executeRaw`ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'user'`;
    await prisma.$executeRaw`ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT false`;
    console.log('Schema updated successfully');
  } catch (error) {
    console.error('Error updating schema:', error);
  }
  
  console.log('Running seed...');
  // Now run the actual seed function
  await import('./seed').then(seedModule => seedModule.main());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });