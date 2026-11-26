import { spawn, spawnSync } from 'node:child_process';
import { access, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
let playwright;
try { playwright = await import('playwright'); }
catch {
  console.error('QA dependencies are missing. Run npm install, then npx playwright install chromium.');
  process.exit(1);
}
const { chromium } = playwright;
const root = process.cwd();
const port = Number(process.env.MOUBON_LIGHTHOUSE_PORT || 5178);
const url = `http://127.0.0.1:${port}/`;
const reports = resolve(root, 'qa-reports');
const cli = resolve(root, 'node_modules', 'lighthouse', 'cli', 'index.js');

async function waitForServer(child) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Dev server exited early (${child.exitCode}).`);
    try { if ((await fetch(url)).ok) return; } catch {}
    await delay(250);
  }
  throw new Error(`Dev server did not become ready at ${url}.`);
}

let server;
let exitCode = 0;
try {
  await access(cli);
  const chromePath = chromium.executablePath();
  await access(chromePath);
  await mkdir(reports, { recursive: true });
  server = spawn(process.execPath, ['scripts/dev-server.mjs'], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
  await waitForServer(server);
  const baseArgs = [url, '--output=html', '--only-categories=performance,accessibility,best-practices,seo', '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage'];
  for (const [name, extra] of [['mobile', []], ['desktop', ['--preset=desktop']]]) {
    const reportPath = join(reports, `lighthouse-${name}.html`);
    const result = spawnSync(process.execPath, [cli, ...baseArgs, ...extra, `--output-path=${reportPath}`], {
      cwd: root,
      env: { ...process.env, CHROME_PATH: chromePath },
      stdio: 'inherit'
    });
    if (result.error) throw result.error;
    if (result.status !== 0) exitCode = result.status || 1;
    else console.log(`Saved ${reportPath}`);
  }
} catch (error) {
  console.error(`${error.message}\nInstall dependencies with npm install, then install Chromium with: npx playwright install chromium`);
  exitCode = 1;
} finally {
  server?.kill('SIGTERM');
}
process.exitCode = exitCode;
