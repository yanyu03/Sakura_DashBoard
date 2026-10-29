import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
const scripts = [
  'test:migrations', 'test:auth', 'test:protection', 'test:reliability',
  'test:hierarchy', 'test:schedule-sharing', 'test:organization',
  'test:first-registration', 'test:tidb-reliability', 'test:preview',
];
const npm = process.env.npm_execpath;
if (!npm) throw Error('Run this coordinator through npm run test:local');
const completed = [];
for (const script of scripts) {
  const result = spawnSync(process.execPath, [npm, 'run', script], { stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    console.error('Local regression failed: ' + script);
    process.exit(result.status || 1);
  }
  completed.push(script);
}
const report = { testedAt: new Date().toISOString(), cloudCredentialsRequired: false, completed, passed: completed.length };
fs.mkdirSync('docs/verification/opensource', { recursive: true });
fs.writeFileSync('docs/verification/opensource/local-regressions.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
