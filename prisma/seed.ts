import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'dcook@spectrum4.ca';
  const password = 'admin123';
  const name = 'Admin User';

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name,
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Admin user created or already exists.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
