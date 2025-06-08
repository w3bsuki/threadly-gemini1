#!/usr/bin/env node

// Conditional dev script for CMS package
// Only runs basehub dev if BASEHUB_TOKEN is available

const { execSync } = require('child_process');

if (process.env.BASEHUB_TOKEN) {
  console.log('✅ BASEHUB_TOKEN found, starting BaseHub dev server...');
  try {
    execSync('basehub dev', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ BaseHub dev server failed:', error.message);
    process.exit(1);
  }
} else {
  console.log('⏭️ Skipping CMS dev server - BASEHUB_TOKEN not found');
  console.log('ℹ️  To enable CMS, add BASEHUB_TOKEN to your .env file');
  console.log('✅ CMS dev server skipped successfully');
  // Keep the process running so Turborepo doesn't think it failed
  setInterval(() => {}, 1000);
}