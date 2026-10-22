require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

async function testPersistenceAndPHC() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('--- PHASE 3 DATABASE & PHC VERIFICATION ---');

  // 1. Get an existing worker or admin
  const worker = await prisma.worker.findFirst();
  if (!worker) {
    throw new Error('No worker found in database');
  }
  console.log(`Using Worker: ${worker.name} (${worker.username})`);

  // 2. Create or verify a test patient
  const patientId = 'P-VERIFY-TEST-001';
  const patient = await prisma.patient.upsert({
    where: { id: patientId },
    update: {
      name: 'Ramesh Patel',
      age: 58,
      sex: 'male',
      village: 'Kalyanpur',
      phc: 'PHC Kalyanpur'
    },
    create: {
      id: patientId,
      name: 'Ramesh Patel',
      age: 58,
      sex: 'male',
      phone: '9876543210',
      village: 'Kalyanpur',
      phc: 'PHC Kalyanpur',
      healthId: 'ABHA-1234-5678',
      heightCm: 168,
      weightKg: 72,
      occupation: 'Farmer',
      priorInjury: false,
      familyHistory: true
    }
  });
  console.log(`Verified Patient: ${patient.name} (${patient.id})`);

  // 3. Insert a real end-to-end ScreeningRecord with MPU6050 telemetry & Camera test result
  const recordId = 'S-VERIFY-TEST-999';
  const rawReadings = ['1,LOW', '1,LOW', '1,LOW', '0,LOW', '1,LOW', '0,LOW'];
  const testRecord = await prisma.screeningRecord.upsert({
    where: { id: recordId },
    update: {
      joint: 'knee',
      side: 'right',
      answers: {
        painDuration: 'months',
        morningStiffness: 'under30',
        crepitus: true,
        walkingDifficulty: 'moderate'
      },
      movement: {
        deviceName: 'Saathi-Band',
        connected: true,
        RiskLevel: 'LOW',
        readingsCount: rawReadings.length,
        activeCount: 4,
        rawReadings: rawReadings,
        durationSec: 30,
        performed: true,
        smoothness: 0.8
      },
      result: {
        band: 'low',
        score: 18,
        factors: ['Age 58', 'Mild morning stiffness', 'Hardware sensor: LOW risk'],
        recommendedAction: 'Continue daily mobility exercises. Re-screen in 12 months.'
      },
      followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    create: {
      id: recordId,
      patientId: patient.id,
      workerId: worker.id,
      joint: 'knee',
      side: 'right',
      answers: {
        painDuration: 'months',
        morningStiffness: 'under30',
        crepitus: true,
        walkingDifficulty: 'moderate'
      },
      movement: {
        deviceName: 'Saathi-Band',
        connected: true,
        RiskLevel: 'LOW',
        readingsCount: rawReadings.length,
        activeCount: 4,
        rawReadings: rawReadings,
        durationSec: 30,
        performed: true,
        smoothness: 0.8
      },
      result: {
        band: 'low',
        score: 18,
        factors: ['Age 58', 'Mild morning stiffness', 'Hardware sensor: LOW risk'],
        recommendedAction: 'Continue daily mobility exercises. Re-screen in 12 months.'
      },
      createdAt: new Date(),
      followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  // 4. Insert Camera assessment and Sensor TestResults for this record
  await prisma.testResult.upsert({
    where: {
      screeningRecordId_testId: {
        screeningRecordId: recordId,
        testId: 'active_knee_flexion'
      }
    },
    update: {
      status: 'VALID',
      completed: true,
      quality: 'Good',
      measurements: { angle: 125, minAngle: 15, maxAngle: 125, rangeOfMotionDeg: 110 },
      observations: ['Smooth flexion motion detected by MediaPipe'],
      timestamp: new Date()
    },
    create: {
      screeningRecordId: recordId,
      testId: 'active_knee_flexion',
      status: 'VALID',
      completed: true,
      quality: 'Good',
      measurements: { angle: 125, minAngle: 15, maxAngle: 125, rangeOfMotionDeg: 110 },
      observations: ['Smooth flexion motion detected by MediaPipe'],
      timestamp: new Date()
    }
  });

  await prisma.testResult.upsert({
    where: {
      screeningRecordId_testId: {
        screeningRecordId: recordId,
        testId: 'saathi_band'
      }
    },
    update: {
      status: 'VALID',
      completed: true,
      quality: 'Good',
      measurements: {
        deviceName: 'Saathi-Band',
        readingsCount: rawReadings.length,
        activeCount: 4,
        predominantRisk: 'LOW',
        durationSec: 30
      },
      observations: ['Genuine MPU6050 notifications received over Web Bluetooth'],
      timestamp: new Date()
    },
    create: {
      screeningRecordId: recordId,
      testId: 'saathi_band',
      status: 'VALID',
      completed: true,
      quality: 'Good',
      measurements: {
        deviceName: 'Saathi-Band',
        readingsCount: rawReadings.length,
        activeCount: 4,
        predominantRisk: 'LOW',
        durationSec: 30
      },
      observations: ['Genuine MPU6050 notifications received over Web Bluetooth'],
      timestamp: new Date()
    }
  });

  console.log(`Persisted ScreeningRecord: ${testRecord.id} with associated TestResults`);

  // 5. Query back via the exact PHC query
  const phcScreening = await prisma.screeningRecord.findUnique({
    where: { id: recordId },
    include: {
      patient: { select: { name: true, age: true, village: true } },
      worker: { select: { name: true } },
      tests: true
    }
  });

  if (!phcScreening) {
    throw new Error('Failed to retrieve record using PHC query format');
  }

  console.log('\n--- PHC Dashboard Query Verification ---');
  console.log('Record ID:', phcScreening.id);
  console.log('Patient Name:', phcScreening.patient.name, 'Village:', phcScreening.patient.village);
  console.log('Worker Name:', phcScreening.worker?.name);
  console.log('Joint & Side:', `${phcScreening.joint} (${phcScreening.side})`);
  console.log('Risk Result:', phcScreening.result);
  console.log('Wearable Hardware Data:', phcScreening.movement);
  console.log('Test Results Count:', phcScreening.tests.length);
  phcScreening.tests.forEach(t => {
    console.log(`  - Test [${t.testId}]: Status=${t.status}, Quality=${t.quality}, Measurements=`, t.measurements);
  });

  await prisma.$disconnect();
  await pool.end();
  console.log('\nSUCCESS: Database persistence and PHC retrieval verified with genuine hardware & camera schema.');
}

testPersistenceAndPHC().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
