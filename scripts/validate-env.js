#!/usr/bin/env node
// Environment validation script
// Runs on postinstall to validate environment variables

const requiredVars = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "R2_ENDPOINT",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "NEXT_PUBLIC_APP_URL",
];

const optionalVars = [
  "REDIS_URL",
  "TYPESENSE_HOST",
  "TYPESENSE_PORT",
  "TYPESENSE_PROTOCOL",
  "TYPESENSE_API_KEY",
  "SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_DSN",
  "LOG_LEVEL",
  "OTEL_EXPORTER_OTLP_ENDPOINT",
  "HEALTH_CHECK_SECRET",
  "CSP_REPORT_URI",
];

console.log("\n[Env Validation] Checking environment variables...\n");

let hasErrors = false;
let missingCount = 0;
let optionalCount = 0;

for (const key of requiredVars) {
  if (!process.env[key]) {
    console.error(`  MISSING: ${key}`);
    hasErrors = true;
    missingCount++;
  } else {
    const value = process.env[key];
    const display = value.length > 40 ? value.substring(0, 37) + "..." : value;
    console.log(`  OK:      ${key}=${display}`);
  }
}

console.log("");
for (const key of optionalVars) {
  if (!process.env[key]) {
    console.log(`  OPTIONAL: ${key} (not set)`);
    optionalCount++;
  } else {
    console.log(`  OK:       ${key}=****`);
  }
}

console.log(`\n[Env Validation] Results:`);
console.log(
  `  Required: ${requiredVars.length} total, ${missingCount} missing`,
);
console.log(
  `  Optional: ${optionalVars.length} total, ${optionalCount} not set`,
);

if (hasErrors) {
  console.error(
    "\n  ❌ Missing required environment variables. See .env.example for reference.\n",
  );
  process.exit(1);
} else {
  console.log("\n  ✅ All required environment variables are set.\n");
}
