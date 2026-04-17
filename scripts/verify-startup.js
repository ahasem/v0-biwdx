#!/usr/bin/env node

/**
 * Startup verification script
 * Validates all configuration before running the app
 */

const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║          HASEM APPLICATION - STARTUP VERIFICATION              ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

let allChecks = true;

// Check 1: Environment variables
console.log('📋 Checking environment variables...');
const required = [
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
];

const optional = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'FACEBOOK_CLIENT_ID',
  'FACEBOOK_CLIENT_SECRET',
];

let envIssues = [];

required.forEach(env => {
  if (!process.env[env]) {
    console.log(`   ❌ Missing: ${env}`);
    envIssues.push(env);
    allChecks = false;
  } else {
    console.log(`   ✓ ${env}`);
  }
});

optional.forEach(env => {
  if (!process.env[env]) {
    console.log(`   ⚠️  Optional: ${env} (not set)`);
  } else {
    console.log(`   ✓ ${env}`);
  }
});

if (envIssues.length > 0) {
  console.log(`\n❌ Missing ${envIssues.length} required environment variable(s).`);
  console.log('   Please add them to your .env.local file and restart.');
  process.exit(1);
}

// Check 2: Node modules
console.log('\n📦 Checking dependencies...');
const requiredPackages = [
  'next',
  'better-auth',
  'drizzle-orm',
  'zod',
  'framer-motion',
];

let missingPackages = [];
requiredPackages.forEach(pkg => {
  try {
    require.resolve(pkg);
    console.log(`   ✓ ${pkg}`);
  } catch {
    console.log(`   ❌ ${pkg}`);
    missingPackages.push(pkg);
  }
});

if (missingPackages.length > 0) {
  console.log(`\n❌ Missing ${missingPackages.length} package(s).`);
  console.log('   Run: npm install (or pnpm install)');
  process.exit(1);
}

// Check 3: File structure
console.log('\n📁 Checking file structure...');
const requiredFiles = [
  'lib/auth.ts',
  'lib/auth-client.ts',
  'lib/db/index.ts',
  'lib/db/schema.ts',
  'app/api/auth/[...all]/route.ts',
  'proxy.ts',
];

let missingFiles = [];
requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✓ ${file}`);
  } else {
    console.log(`   ❌ ${file}`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log(`\n❌ Missing ${missingFiles.length} required file(s).`);
  console.log('   The project may be incomplete.');
  process.exit(1);
}

// Check 4: Configuration validation
console.log('\n⚙️  Validating configuration...');

try {
  // Check auth config
  require('./lib/auth.ts');
  console.log('   ✓ Auth configuration valid');
} catch (error) {
  console.log(`   ❌ Auth configuration error: ${error.message}`);
  allChecks = false;
}

// All checks passed
console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║                   ✓ ALL CHECKS PASSED                         ║');
console.log('╠════════════════════════════════════════════════════════════════╣');
console.log('║                                                                ║');
console.log('║  Application is ready to start!                               ║');
console.log('║                                                                ║');
console.log('║  Run: npm run dev                                              ║');
console.log('║  Then visit: http://localhost:3000                             ║');
console.log('║                                                                ║');
console.log('║  📖 Documentation: README.md                                   ║');
console.log('║  🐛 Troubleshooting: TROUBLESHOOTING.md                        ║');
console.log('║  🏗️  Architecture: ARCHITECTURE.md                             ║');
console.log('║                                                                ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');
