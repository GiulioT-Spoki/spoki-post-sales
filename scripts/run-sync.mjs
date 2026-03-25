import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

// Dynamic imports after env is loaded
const { runFullSync } = await import('../src/lib/hubspot/sync.ts');
const { calculateAllHealthScores } = await import('../src/lib/health-score/calculator.ts');

console.log('Starting HubSpot sync...');
const syncResult = await runFullSync();
console.log('Sync result:', JSON.stringify(syncResult, null, 2));

console.log('\nCalculating health scores...');
const healthResult = await calculateAllHealthScores();
console.log('Health scores:', JSON.stringify(healthResult, null, 2));

process.exit(0);
