require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

async function test() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Connecting to Neon PostgreSQL target...');
  const [patients, screenings, workers, testResults] = await Promise.all([
    prisma.patient.count(),
    prisma.screeningRecord.count(),
    prisma.worker.count(),
    prisma.testResult.count()
  ]);

  console.log('Neon Database Status:', {
    patients,
    screenings,
    workers,
    testResults
  });

  // Verify PHC admin user exists
  const admin = await prisma.worker.findFirst({
    where: { role: 'PHC_ADMIN' },
    select: { id: true, username: true, role: true, name: true }
  });
  console.log('PHC Admin Worker:', admin);

  await prisma.$disconnect();
  await pool.end();
}

test().catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
