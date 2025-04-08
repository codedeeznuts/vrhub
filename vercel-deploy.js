const fs = require('fs-extra');
const path = require('path');

// Ensure build directory exists
console.log('Setting up build directory for Vercel...');

// Create build directory if it doesn't exist
if (!fs.existsSync('build')) {
  fs.mkdirSync('build', { recursive: true });
  console.log('Created build directory');
}

// If client/build exists, copy its contents to build/
if (fs.existsSync('client/build')) {
  console.log('Copying client/build to build/');
  fs.copySync('client/build', 'build');
}

// Create a placeholder index.html if not found
if (!fs.existsSync('build/index.html')) {
  console.log('Creating placeholder index.html');
  fs.writeFileSync('build/index.html', '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=/"></head><body>Redirecting...</body></html>');
}

// Create static.json for routing
console.log('Creating static.json');
fs.writeFileSync('build/static.json', JSON.stringify({
  root: 'build/',
  routes: { '/**': 'index.html' }
}));

console.log('Build directory setup complete'); 