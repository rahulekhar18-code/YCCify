const { spawn } = require('child_process');

console.log('=======================================================');
console.log('🚀 Starting YCCify Full-Stack Development Environment...');
console.log('=======================================================');

// 1. Start Backend
const backend = spawn('npm', ['run', 'dev:backend'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

// 2. Start Web Frontend
const web = spawn('npm', ['run', 'dev:web'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

// Handle graceful exit
function cleanExit() {
  console.log('\nShutting down servers...');
  if (backend.pid) process.kill(backend.pid);
  if (web.pid) process.kill(web.pid);
  process.exit();
}

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);

