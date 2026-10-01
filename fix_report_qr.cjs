const fs = require('fs');
let content = fs.readFileSync('src/features/reports/Report.tsx', 'utf-8');

const qrDataSetup = \
  const qrData = JSON.stringify({
    n: p.name,
    a: p.age,
    s: p.sex,
    j: rec.joint,
    sd: rec.side,
    d: rec.date,
    rb: rec.result.band,
    w: workerName,
    phc: p.phc,
  })
  const qrUrl = \\\\/patient-pdf?d=\\\\
\;

content = content.replace(
  '  return (',
  qrDataSetup + '\\n  return ('
);

content = content.replace(
  '\https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=\\',
  '\https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=\\'
);

fs.writeFileSync('src/features/reports/Report.tsx', content);
console.log('Report.tsx updated');
