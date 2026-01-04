import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
// This script is running in nexdefend-frontend/
const frontendDir = __dirname;
const distDir = path.join(frontendDir, 'dist');
// The target is nexdefend-desktop/frontend/dist
// Relative to nexdefend-frontend, that is ../nexdefend-desktop/frontend/dist
const targetDir = path.resolve(frontendDir, '../nexdefend-desktop/frontend/dist');

console.log('Starting desktop frontend build process...');

// 1. Run the build
console.log('Running: npm run build -- --mode desktop');
try {
  execSync('npm run build -- --mode desktop', {
    stdio: 'inherit',
    cwd: frontendDir,
    shell: true // Ensure it uses the shell (cmd.exe on Windows) to find npm
  });
} catch (error) {
  console.error('Build command failed.');
  process.exit(1);
}

// 2. Clear target directory
console.log(`Clearing target directory: ${targetDir}`);
try {
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
} catch (error) {
  console.error(`Failed to remove target directory: ${error.message}`);
  process.exit(1);
}

// 3. Copy dist to target
console.log(`Copying build artifacts from ${distDir} to ${targetDir}`);

// Ensure parent directory of target exists
const targetParent = path.dirname(targetDir);
if (!fs.existsSync(targetParent)) {
  fs.mkdirSync(targetParent, { recursive: true });
}

try {
  // Use cpSync (Node 16.7+)
  fs.cpSync(distDir, targetDir, { recursive: true });
  console.log('Copy successful.');
} catch (error) {
  console.error(`Failed to copy files: ${error.message}`);
  process.exit(1);
}

console.log('Desktop build and sync complete.');
