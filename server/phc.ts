import express from 'express';
import { prisma } from './db';
import { authenticate, requirePHC } from './middleware';

const router = express.Router();

// All PHC routes are protected and require PHC role
router.use(authenticate, requirePHC);

// 1. Overview Dashboard Stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalPatients = await prisma.patient.count();
    const totalScreenings = await prisma.screeningRecord.count();
    const workers = await prisma.worker.count();
    
    // Follow-ups due (in past or today)
    const followUpsDue = await prisma.screeningRecord.count({
      where: {
        followUpDate: { lte: new Date() }
      }
    });

    // Recent screenings
    const recentScreenings = await prisma.screeningRecord.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          select: { name: true, village: true }
        }
      }
    });

    // Risk distribution - we need to query all records to get the JSON result band
    // In a real large app we might index this, but for MVP we fetch and group
    const records = await prisma.screeningRecord.findMany({
      select: { result: true }
    });
    
    const riskDistribution = { higher: 0, moderate: 0, low: 0, insufficient: 0 };
    for (const r of records) {
       const result = r.result as any;
       if (result && result.band && riskDistribution[result.band as keyof typeof riskDistribution] !== undefined) {
          riskDistribution[result.band as keyof typeof riskDistribution]++;
       }
    }

    res.json({
      totalPatients,
      totalScreenings,
      workers,
      followUpsDue,
      recentScreenings,
      riskDistribution
    });
  } catch (error) {
    console.error('Error fetching PHC dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// 2. Patients List
router.get('/patients', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { records: true }
        }
      }
    });
    res.json(patients);
  } catch (error) {
    console.error('Error fetching PHC patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// 3. Screenings List
router.get('/screenings', async (req, res) => {
  try {
    const screenings = await prisma.screeningRecord.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { name: true, age: true, village: true } },
        worker: { select: { name: true } }
      }
    });
    res.json(screenings);
  } catch (error) {
    console.error('Error fetching PHC screenings:', error);
    res.status(500).json({ error: 'Failed to fetch screenings' });
  }
});

// 4. Workers List
router.get('/workers', async (req, res) => {
  try {
    const workersList = await prisma.worker.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        createdAt: true,
        _count: {
          select: { records: true }
        }
      }
    });
    res.json(workersList);
  } catch (error) {
    console.error('Error fetching PHC workers:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// 5. Follow-ups
router.get('/follow-ups', async (req, res) => {
  try {
    const followUps = await prisma.screeningRecord.findMany({
      where: { followUpDate: { not: null } },
      orderBy: { followUpDate: 'asc' },
      include: {
        patient: { select: { name: true, phone: true, village: true } },
        worker: { select: { name: true } }
      }
    });
    res.json(followUps);
  } catch (error) {
    console.error('Error fetching PHC follow-ups:', error);
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  }
});

// 6. Analytics
router.get('/analytics', async (req, res) => {
  try {
    const timeRange = (req.query.timeRange as string) || '30d'; // '7d', '30d', '90d', 'all'
    
    let dateFilter = {}
    if (timeRange !== 'all') {
      const days = parseInt(timeRange.replace('d', '')) || 30
      const date = new Date()
      date.setDate(date.getDate() - days)
      dateFilter = { gte: date }
    }

    const whereClause = timeRange === 'all' ? {} : { createdAt: dateFilter }

    // 1. Top level stats
    const totalPatients = await prisma.patient.count({ where: timeRange === 'all' ? {} : { createdAt: dateFilter } })
    const totalScreenings = await prisma.screeningRecord.count({ where: whereClause })
    const followUpsDue = await prisma.screeningRecord.count({
      where: {
        ...whereClause,
        followUpDate: { lte: new Date() }
      }
    })

    // 2. Fetch records in memory for aggregation (safe for PHC scale)
    const screenings = await prisma.screeningRecord.findMany({
      where: whereClause,
      select: { createdAt: true, result: true, joint: true, workerId: true, patient: { select: { village: true } } },
      orderBy: { createdAt: 'asc' }
    })

    const activityByDate: Record<string, number> = {}
    const riskDistribution = { higher: 0, moderate: 0, low: 0, insufficient: 0 }
    const jointDistribution: Record<string, number> = {}
    const villageDistribution: Record<string, number> = {}
    
    screenings.forEach(s => {
      const dateStr = new Date(s.createdAt).toISOString().split('T')[0]
      activityByDate[dateStr] = (activityByDate[dateStr] || 0) + 1
      
      const band = (s.result as any)?.band || 'insufficient'
      if (riskDistribution[band as keyof typeof riskDistribution] !== undefined) {
        riskDistribution[band as keyof typeof riskDistribution]++
      } else {
        riskDistribution.insufficient++
      }

      jointDistribution[s.joint] = (jointDistribution[s.joint] || 0) + 1

      const village = s.patient?.village || 'Unknown'
      villageDistribution[village] = (villageDistribution[village] || 0) + 1
    })

    const screeningActivity = Object.keys(activityByDate).map(date => ({ date, count: activityByDate[date] }))

    // 3. Age Distribution
    const patients = await prisma.patient.findMany({
      where: timeRange === 'all' ? {} : { createdAt: dateFilter },
      select: { age: true }
    })

    const ageDistribution = { '18-29': 0, '30-44': 0, '45-59': 0, '60+': 0 }
    patients.forEach(p => {
      if (p.age >= 60) ageDistribution['60+']++
      else if (p.age >= 45) ageDistribution['45-59']++
      else if (p.age >= 30) ageDistribution['30-44']++
      else ageDistribution['18-29']++
    })

    // 4. Worker Activity
    const workers = await prisma.worker.findMany({
      select: { id: true, name: true }
    })
    
    const workerActivityRecord: Record<string, number> = {}
    screenings.forEach(s => {
      workerActivityRecord[s.workerId] = (workerActivityRecord[s.workerId] || 0) + 1
    })
    
    const workerActivity = workers.map(w => ({
      name: w.name,
      screenings: workerActivityRecord[w.id] || 0
    })).sort((a, b) => b.screenings - a.screenings)

    // 5. Follow-ups insight
    const upcomingFollowUps = await prisma.screeningRecord.count({
      where: {
        ...whereClause,
        followUpDate: { gt: new Date() }
      }
    })

    res.json({
      summary: {
        totalPatients,
        totalScreenings,
        higherRisk: riskDistribution.higher,
        followUpsDue
      },
      screeningActivity,
      riskDistribution: Object.keys(riskDistribution).map(name => ({ name, value: riskDistribution[name as keyof typeof riskDistribution] })),
      jointDistribution: Object.keys(jointDistribution).map(name => ({ name, value: jointDistribution[name] })),
      ageDistribution: Object.keys(ageDistribution).map(name => ({ name, value: ageDistribution[name as keyof typeof ageDistribution] })),
      workerActivity,
      communityActivity: Object.keys(villageDistribution).map(name => ({ name, value: villageDistribution[name] })).sort((a,b) => b.value - a.value),
      followUpInsight: {
        due: followUpsDue,
        upcoming: upcomingFollowUps
      }
    })

  } catch (error) {
    console.error('Analytics fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

// 7. Reports List
router.get('/reports', async (req, res) => {
  try {
    const search = (req.query.search as string) || '';
    
    let whereClause = {};
    if (search) {
      whereClause = {
        patient: {
          name: { contains: search, mode: 'insensitive' }
        }
      };
    }

    const reports = await prisma.screeningRecord.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { name: true, healthId: true } },
        worker: { select: { name: true } }
      }
    });

    res.json(reports);
  } catch (error) {
    console.error('Error fetching PHC reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// 8. Report Detail
router.get('/reports/:id', async (req, res) => {
  try {
    const report = await prisma.screeningRecord.findUnique({
      where: { id: req.params.id },
      include: {
        patient: true,
        worker: true,
        tests: true
      }
    });
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Error fetching PHC report detail:', error);
    res.status(500).json({ error: 'Failed to fetch report detail' });
  }
});
router.get('/sync-status', async (req, res) => {
  try {
    // Basic connectivity is assumed if this resolves

    const totalPatients = await prisma.patient.count();
    const totalScreenings = await prisma.screeningRecord.count();
    
    const latestPatient = await prisma.patient.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });
    
    const latestScreening = await prisma.screeningRecord.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    const workers = await prisma.worker.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        _count: {
          select: { records: true }
        }
      }
    });

    const workerActivity = await Promise.all(workers.map(async (w) => {
      const latestWorkerRecord = await prisma.screeningRecord.findFirst({
        where: { workerId: w.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });

      // Get unique patients for this worker using grouped records
      // In PostgreSQL we could do distinct but let's just group by patientId
      const uniquePatients = await prisma.screeningRecord.groupBy({
        by: ['patientId'],
        where: { workerId: w.id },
      });

      return {
        id: w.id,
        name: w.name,
        username: w.username,
        totalScreenings: w._count.records,
        patientsScreened: uniquePatients.length,
        lastActivity: latestWorkerRecord?.createdAt || null
      };
    }));

    res.json({
      status: 'Connected',
      dataFreshness: {
        totalPatients,
        totalScreenings,
        latestPatientReceived: latestPatient?.createdAt || null,
        latestScreeningReceived: latestScreening?.createdAt || null
      },
      workerActivity: workerActivity.sort((a, b) => {
        if (!a.lastActivity) return 1;
        if (!b.lastActivity) return -1;
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      })
    });
  } catch (error) {
    console.error('Error fetching PHC sync status:', error);
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
});

// 10. Community & Outreach
router.get('/community', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        records: true
      }
    });

    const villageMap: Record<string, any> = {};

    let totalPatients = 0;
    let totalScreenings = 0;
    let totalFollowUpsDue = 0;

    patients.forEach(patient => {
      const village = patient.village || 'Unknown';
      if (!villageMap[village]) {
        villageMap[village] = {
          name: village,
          patients: 0,
          screenings: 0,
          higherRisk: 0,
          followUpsDue: 0,
          latestActivity: null
        };
      }

      villageMap[village].patients++;
      totalPatients++;

      if (patient.records && patient.records.length > 0) {
        patient.records.forEach(r => {
          villageMap[village].screenings++;
          totalScreenings++;
          
          const band = (r.result as any)?.band;
          if (band === 'higher') {
             villageMap[village].higherRisk++;
          }

          if (r.followUpDate && new Date(r.followUpDate) <= new Date()) {
             villageMap[village].followUpsDue++;
             totalFollowUpsDue++;
          }

          if (!villageMap[village].latestActivity || new Date(r.createdAt) > new Date(villageMap[village].latestActivity)) {
             villageMap[village].latestActivity = r.createdAt;
          }
        });
      }
    });

    const villages = Object.values(villageMap).sort((a, b) => b.screenings - a.screenings);

    res.json({
      summary: {
        totalVillages: Object.keys(villageMap).length,
        totalPatients,
        totalScreenings,
        followUpsDue: totalFollowUpsDue
      },
      villages
    });
  } catch (error) {
    console.error('Error fetching PHC community data:', error);
    res.status(500).json({ error: 'Failed to fetch community data' });
  }
});

export default router;
