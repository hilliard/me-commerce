#!/usr/bin/env node
/* CI Orchestrator: Run migrations, seed admin, start frontend, run E2E tests, cleanup.
   This script is designed to be CI-friendly and run on Linux/Unix-like environments.
*/
const { spawnSync, spawn } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const path = require('path');

const FRONTEND_PORT = process.env.FRONTEND_PORT ? parseInt(process.env.FRONTEND_PORT) : 5173;
const FRONTEND_DIR = path.resolve(__dirname, '../../client');
const SERVER_DIR = path.resolve(__dirname, '..');

function run(cmd, args, opts = {}) {
  console.log(`> ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  if (res.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
}

async function waitForPort(port, timeoutMs) {
  const net = require('net');
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      const socket = net.connect({ port, host: '127.0.0.1' }, () => {
        socket.destroy();
        clearInterval(timer);
        resolve();
      });
      socket.on('error', () => {
        socket.destroy();
      });
    }, 200);
    setTimeout(() => {
      clearInterval(timer);
      reject(new Error(`Timeout waiting for port ${port}`));
    }, timeoutMs);
  });
}

async function main() {
  try {
    // 1) Migrations
    process.chdir(SERVER_DIR);
    console.log('Running database migrations...');
    run('npm', ['run', 'db:push']);

    // 2) Seed Admin
    console.log('Seeding admin user...');
    run('npm', ['run', 'admin:seed']);

    // 3) Frontend: Build and serve or run dev server
    let frontendPid = null;
    if (existsSync(path.resolve(FRONTEND_DIR, 'package.json'))) {
      const clientPkg = JSON.parse(readFileSync(path.resolve(FRONTEND_DIR, 'package.json'), 'utf8'));
      const hasBuild = clientPkg?.scripts?.build ? true : false;
      const hasDev = clientPkg?.scripts?.dev ? true : false;
      if (hasBuild) {
        console.log('Frontend build detected. Building...');
        process.chdir(FRONTEND_DIR);
        run('npm', ['ci']);
        run('npm', ['run', 'build']);
        // Serve built assets using a lightweight static server
        frontendPid = spawn('npx', ['serve', '-s', 'dist', '-l', String(FRONTEND_PORT)], { detached: true, stdio: 'ignore' });
        frontendPid.unref();
      } else if (hasDev) {
        console.log('Frontend dev server detected. Starting in background...');
        process.chdir(FRONTEND_DIR);
        run('npm', ['ci']);
        frontendPid = spawn('npm', ['run', 'dev'], { detached: true, stdio: 'ignore' });
        frontendPid.unref();
      } else {
        console.warn('No frontend build or dev script found. Skipping frontend start.');
      }
      // Return to server dir for tests
      process.chdir(SERVER_DIR);
    }

    // 4) Wait for frontend to be ready if we started it
    try {
      await waitForPort(FRONTEND_PORT, 600000); // wait up to 10 minutes
      console.log(`Frontend available on port ${FRONTEND_PORT}`);
    } catch (e) {
      console.warn('Frontend did not become ready in time:', e.message);
    }

    // 5) Ensure Playwright browsers are installed for E2E tests
    console.log('Installing Playwright browsers (if needed)...');
    run('npx', ['playwright', 'install'], { stdio: 'inherit' });

    // 6) Run E2E tests
    console.log('Running Playwright E2E tests...');
    run('npx', ['playwright', 'test', 'server/tests/e2e', '--config', 'server/tests/e2e/playwright.config.ts'], { stdio: 'inherit' });

    // 7) CleanupFrontend if we started it
    if (frontendPid) {
      try { process.kill(-frontendPid.pid); } catch(e) { /* ignore */ }
    }
    console.log('CI run completed successfully');
  } catch (err) {
    console.error('CI run failed:', err.message);
    process.exit(1);
  }
}

main();
