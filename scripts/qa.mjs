import { spawnSync } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const steps = [
  ['check', ['run', 'check']],
  ['test', ['test']],
  ['build', ['run', 'build']],
  ['story-video-assets', ['run', 'river:verify-videos']],
  ['river-bank-assets', ['run', 'river:verify-assets']],
  ['full-site-shots', ['run', 'shots']],
  ['river-shots', ['run', 'river:shots']],
  ['prelaunch', ['run', 'prelaunch']]
];
const results = [];
for (const [name, args] of steps) {
  console.log(`\n========== QA: ${name.toUpperCase()} ==========`);
  const result = spawnSync(npm, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  const ok = result.status === 0;
  results.push({ name, ok, status: result.status ?? 1 });
  console.log(`========== ${name.toUpperCase()}: ${ok ? 'PASS' : 'FAIL'} ==========`);
}
console.log('\nQA summary:');
for (const result of results) console.log(`${result.ok ? 'PASS' : 'FAIL'} — ${result.name} (exit ${result.status})`);
const failures = results.filter(result => !result.ok);
console.log(`\n${failures.length ? `${failures.length} QA stage(s) failed.` : 'All QA stages passed.'}`);
if (failures.length) process.exitCode = 1;
