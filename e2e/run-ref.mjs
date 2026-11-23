import { spawnSync } from 'node:child_process';

const env = {
  ...process.env,
  STUDIO_REF_DIR: process.env.STUDIO_REF_DIR || '../cubit-studio-handoff',
};
const result = spawnSync('npx', ['playwright', 'test'], {
  stdio: 'inherit',
  shell: true,
  env,
});
process.exit(result.status ?? 1);
