import { prisma } from './db';

async function main() {
  const testPatientIds = ['P-4K2M9A', 'P-7H3QZT', 'P-2B8XNC'];
  
  for (const id of testPatientIds) {
    try {
      const records = await prisma.screeningRecord.findMany({ where: { patientId: id } });
      for (const record of records) {
        await prisma.testResult.deleteMany({ where: { screeningRecordId: record.id } });
        await prisma.screeningRecord.delete({ where: { id: record.id } });
      }
      await prisma.patient.delete({ where: { id } });
      console.log(`Deleted test patient: ${id}`);
    } catch (e) {
      console.log(`Could not delete or not found: ${id}`, e.message);
    }
  }
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
