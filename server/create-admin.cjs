require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const username = 'phcadmin';
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.worker.findUnique({ where: { username } });
  
  if (existing) {
    await prisma.worker.update({
      where: { id: existing.id },
      data: { role: 'PHC_ADMIN', passwordHash: hashedPassword }
    });
    console.log('Updated existing user to PHC_ADMIN');
  } else {
    await prisma.worker.create({
      data: {
        username,
        name: 'PHC Administrator',
        passwordHash: hashedPassword,
        role: 'PHC_ADMIN'
      }
    });
    console.log('Created new PHC_ADMIN user');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
