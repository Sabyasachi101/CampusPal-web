// Quick verification script to check if everything is set up correctly
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying CampusPal Setup...\n');

const checks = {
  passed: [],
  failed: []
};

// Check 1: package.json exists
if (fs.existsSync('package.json')) {
  checks.passed.push('✅ package.json found');
} else {
  checks.failed.push('❌ package.json missing');
}

// Check 2: node_modules exists
if (fs.existsSync('node_modules')) {
  checks.passed.push('✅ node_modules found (dependencies installed)');
} else {
  checks.failed.push('❌ node_modules missing - Run: npm install');
}

// Check 3: Critical files exist
const criticalFiles = [
  'src/App.tsx',
  'src/main.tsx',
  'src/FirebaseConfig.ts',
  'src/contexts/AuthContext.tsx',
  'src/pages/Login.tsx',
  'src/pages/SignUp.tsx',
  'src/pages/Index.tsx',
  'src/pages/Feed.tsx'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    checks.passed.push(`✅ ${file} exists`);
  } else {
    checks.failed.push(`❌ ${file} missing`);
  }
});

// Check 4: Firebase config
try {
  const firebaseConfig = fs.readFileSync('src/FirebaseConfig.ts', 'utf8');
  if (firebaseConfig.includes('apiKey') && firebaseConfig.includes('projectId')) {
    checks.passed.push('✅ Firebase config looks good');
  } else {
    checks.failed.push('❌ Firebase config incomplete');
  }
} catch (e) {
  checks.failed.push('❌ Could not read Firebase config');
}

// Check 5: UI components
const uiComponentsDir = 'src/components/ui';
if (fs.existsSync(uiComponentsDir)) {
  const components = fs.readdirSync(uiComponentsDir);
  if (components.length > 20) {
    checks.passed.push(`✅ UI components found (${components.length} components)`);
  } else {
    checks.failed.push(`❌ Missing UI components (only ${components.length} found)`);
  }
} else {
  checks.failed.push('❌ UI components directory missing');
}

// Print results
console.log('📊 RESULTS:\n');
console.log('PASSED:');
checks.passed.forEach(check => console.log('  ' + check));

if (checks.failed.length > 0) {
  console.log('\n⚠️  FAILED:');
  checks.failed.forEach(check => console.log('  ' + check));
  console.log('\n🔧 FIX: Address the issues above before running npm run dev');
  process.exit(1);
} else {
  console.log('\n✨ ALL CHECKS PASSED! You\'re ready to go!');
  console.log('\n🚀 Next step: Run "npm run dev" and open http://localhost:5173/');
  process.exit(0);
}
