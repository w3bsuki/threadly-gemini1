#!/usr/bin/env node

// Conditional build script for CMS package
// Only runs basehub build if BASEHUB_TOKEN is available

const { execSync } = require('child_process');

if (process.env.BASEHUB_TOKEN) {
  console.log('✅ BASEHUB_TOKEN found, running basehub build...');
  try {
    execSync('basehub build', { stdio: 'inherit' });
    console.log('✅ BaseHub build completed successfully');
  } catch (error) {
    console.error('❌ BaseHub build failed:', error.message);
    process.exit(1);
  }
} else {
  console.log('⏭️ Skipping CMS build - BASEHUB_TOKEN not found (this is okay for deployment without CMS)');
  console.log('✅ CMS build skipped successfully');
} 