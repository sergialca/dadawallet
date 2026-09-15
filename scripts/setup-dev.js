const { spawnSync } = require('child_process');
const { copyFileSync, existsSync } = require('fs');
const { join } = require('path');

const root = join(__dirname, '..');
const envExample = join(root, '.env.example');
const envFile = join(root, '.env');

function parseNodeVersion(version) {
  const [major, minor] = version.replace(/^v/, '').split('.').map(Number);
  return { major, minor };
}

const node = parseNodeVersion(process.version);
if (node.major < 22 || (node.major === 22 && node.minor < 13)) {
  console.error(`dadawallet needs Node.js 22.13 or newer (Expo SDK 57). Found ${process.version}.`);
  process.exit(1);
}

if (!existsSync(envExample)) {
  console.error('Missing .env.example. Clone the repo again or restore that file.');
  process.exit(1);
}

if (!existsSync(envFile)) {
  copyFileSync(envExample, envFile);
  console.log('Created .env from .env.example. Add your API keys before starting the app.');
} else {
  console.log('.env already exists; leaving it unchanged.');
}

const install = spawnSync('pnpm', ['install'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});

if (install.status !== 0) {
  console.error('pnpm install failed. Install pnpm (https://pnpm.io/installation) and retry.');
  process.exit(install.status ?? 1);
}

console.log(`
Setup complete.

1. Fill in .env (Privy is required; Alchemy and Ondo unlock activity and live quotes).
2. Build a native dev client: pnpm ios   or   pnpm android
3. Restart Expo after changing .env.

See README.md for dashboard configuration and prerequisites.
`);
