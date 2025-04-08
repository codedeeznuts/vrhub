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
  console.log('Copy complete');
}

// Create a placeholder index.html if not found
if (!fs.existsSync('build/index.html')) {
  console.log('Creating placeholder index.html');
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="VR Hub - Your VR video platform" />
    <title>VR Hub</title>
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; 
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #121212;
        color: white;
        text-align: center;
      }
      h1 { font-size: 2rem; margin-bottom: 1rem; }
      p { font-size: 1rem; }
    </style>
  </head>
  <body>
    <div>
      <h1>VR Hub</h1>
      <p>Loading application...</p>
    </div>
  </body>
</html>`;
  fs.writeFileSync('build/index.html', indexHtml);
}

// List the contents of the build directory to debug
console.log('Build directory contents:');
if (fs.existsSync('build')) {
  const files = fs.readdirSync('build');
  console.log(files);
  
  // Check for index.html specifically
  if (files.includes('index.html')) {
    console.log('index.html exists in build directory');
    const stats = fs.statSync('build/index.html');
    console.log(`index.html size: ${stats.size} bytes`);
  } else {
    console.log('WARNING: index.html NOT found in build directory');
  }
} else {
  console.log('WARNING: build directory does not exist');
}

// Create static.json for routing
console.log('Creating static.json');
fs.writeFileSync('build/static.json', JSON.stringify({
  root: 'build/',
  routes: { '/**': 'index.html' }
}, null, 2));

console.log('Build directory setup complete'); 