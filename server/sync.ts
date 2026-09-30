import { Router, Response } from 'express';
import { prisma } from './db';
import { Prisma } from '@prisma/client';
import { authenticate, AuthRequest } from './middleware';

const router = Router();

router.use(authenticate);

// Batch sync patients
router.post('/patients', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { patients } = req.body;
    if (!patients || !Array.isArray(patients)) {
      return res.status(400).json({ error: 'Invalid patients payload' });
    }

    const synced = [];
    const failed = [];

    for (const patient of patients) {
      try {
        await prisma.patient.upsert({
          where: { id: patient.id },
          update: {
            name: patient.name,
            age: patient.age,
            sex: patient.sex,
            phone: patient.phone,
            village: patient.village,
            phc: patient.phc,
            healthId: patient.healthId,
            heightCm: patient.heightCm,
            weightKg: patient.weightKg,
            occupation: patient.occupation,
            priorInjury: patient.priorInjury,
            familyHistory: patient.familyHistory,
          },
          create: {
            id: patient.id,
            name: patient.name,
            age: patient.age,
            sex: patient.sex,
            phone: patient.phone,
            village: patient.village,
            phc: patient.phc,
            healthId: patient.healthId,
            heightCm: patient.heightCm,
            weightKg: patient.weightKg,
            occupation: patient.occupation,
            priorInjury: patient.priorInjury,
            familyHistory: patient.familyHistory,
            createdAt: new Date(patient.createdAt || Date.now()),
          },
        });
        synced.push(patient.id);
      } catch (err) {
        console.error(`Failed to sync patient ${patient.id}`, err);
        failed.push(patient.id);
      }
    }

    res.json({ synced, failed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch sync records
router.post('/records', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { records } = req.body;
    const workerId = req.worker.id;

    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid records payload' });
    }

    const synced = [];
    const failed = [];

    for (const record of records) {
      try {
        await prisma.$transaction(async (tx) => {
          // Upsert ScreeningRecord (idempotency by record.id)
          await tx.screeningRecord.upsert({
            where: { id: record.id },
            update: {
              joint: record.joint,
              side: record.side,
              answers: record.answers ?? Prisma.JsonNull,
              movement: record.movement ?? Prisma.DbNull,
              result: record.result ?? Prisma.JsonNull,
              followUpDate: record.followUpDate ? new Date(record.followUpDate) : null,
            },
            create: {
              id: record.id,
              patientId: record.patientId,
              workerId: workerId,
              joint: record.joint,
              side: record.side,
              answers: record.answers ?? Prisma.JsonNull,
              movement: record.movement ?? Prisma.DbNull,
              result: record.result ?? Prisma.JsonNull,
              createdAt: new Date(record.createdAt || Date.now()),
              followUpDate: record.followUpDate ? new Date(record.followUpDate) : null,
            },
          });

          // Sync tests for this record
          if (record.tests && Array.isArray(record.tests)) {
            for (const test of record.tests) {
              await tx.testResult.upsert({
                where: { 
                  screeningRecordId_testId: { 
                    screeningRecordId: record.id, 
                    testId: test.testId 
                  } 
                },
                update: {
                  status: test.status,
                  completed: test.completed,
                  quality: test.quality,
                  measurements: test.measurements ?? Prisma.DbNull,
                  observations: test.observations ?? Prisma.DbNull,
                  technicalDetails: test.technicalDetails ?? Prisma.DbNull,
                  timestamp: new Date(test.timestamp),
                },
                create: {
                  testId: test.testId,
                  status: test.status,
                  completed: test.completed,
                  quality: test.quality,
                  measurements: test.measurements ?? Prisma.DbNull,
                  observations: test.observations ?? Prisma.DbNull,
                  technicalDetails: test.technicalDetails ?? Prisma.DbNull,
                  timestamp: new Date(test.timestamp),
                  screeningRecordId: record.id
                }
              });
            }
          }
        });

        synced.push(record.id);
      } catch (err) {
        console.error(`Failed to sync record ${record.id}`, err);
        failed.push(record.id);
      }
    }

    res.json({ synced, failed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/records', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const records = await prisma.screeningRecord.findMany({
      where: { workerId: req.worker.id },
      include: { tests: true }
    });
    res.json({ records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
