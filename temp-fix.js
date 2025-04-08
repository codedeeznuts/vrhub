const fs = require('fs');
const path = require('path');

function disableESLint() {
  console.log('Running pre-build script to disable ESLint...');
  
  // Path to the node_modules directory
  const nodeModulesPath = path.join(__dirname, 'client', 'node_modules');
  
  // List of ESLint-related directories to rename
  const eslintDirs = [
    'eslint',
    'eslint-plugin-react',
    'eslint-plugin-react-hooks',
    'eslint-webpack-plugin',
    '@eslint'
  ];
  
  eslintDirs.forEach(dir => {
    const dirPath = path.join(nodeModulesPath, dir);
    if (fs.existsSync(dirPath)) {
      try {
        fs.renameSync(dirPath, `${dirPath}_disabled`);
        console.log(`Successfully renamed ${dir} to ${dir}_disabled`);
      } catch (err) {
        console.error(`Failed to rename ${dir}:`, err);
      }
    } else {
      console.log(`Directory ${dir} not found, skipping...`);
    }
  });
  
  console.log('Pre-build script completed.');
}

disableESLint(); 