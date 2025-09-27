// Simple startup script to test the application
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Payment Verification System...\n');

// Start the server
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
});

server.on('close', (code) => {
  console.log(`\n📊 Server process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGTERM');
  process.exit(0);
});
