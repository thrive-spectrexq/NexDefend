const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Starting Homepage verification...');
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Navigate to the local dev server (assuming it's running, if not we need to start it or serve dist)
  // Since we just built, we can try to serve the dist folder or just assume dev server is running?
  // Actually, usually in this env we rely on the dev server being up or we start one.
  // I'll start a simple preview server for the build.

  // Wait, I can't easily start a long running process in this script without blocking.
  // I will assume the user has the dev server running or I should use `npm run preview` in background.
  // Let's try to connect to 5173. If it fails, I'll error out.

  try {
    // Start a static file server for the dist folder
    // Using a simple python server is often easiest in these envs if node http-server isn't installed.
    // But I'll try to just start vite preview in background from the bash session first.
    // For now, let's just assume I will run `npm run preview` before this script.

    await page.goto('http://localhost:4173'); // Vite preview default port

    console.log('Page loaded. Waiting for content...');
    await page.waitForSelector('text=Defend Your Digital Frontier', { timeout: 10000 });

    console.log('Hero text found.');

    // Check for stats
    await page.waitForSelector('text=Active Monitoring');
    console.log('Stats bar found.');

    // Check for capabilities
    await page.waitForSelector('text=CAPABILITIES');
    console.log('Capabilities section found.');

    // Screenshot
    await page.screenshot({ path: 'homepage_redesign.png', fullPage: true });
    console.log('Screenshot saved to homepage_redesign.png');

  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
