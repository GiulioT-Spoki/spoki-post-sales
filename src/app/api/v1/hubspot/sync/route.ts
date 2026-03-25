import { NextRequest, NextResponse } from 'next/server';
import { runFullSync } from '@/lib/hubspot/sync';
import { calculateAllHealthScores } from '@/lib/health-score/calculator';
import { verifyCronRequest } from '@/lib/api/middleware';
import { getLogger } from '@/lib/logger';

const logger = getLogger('api:hubspot:sync');

async function runSync(): Promise<NextResponse> {
  try {
    logger.info('Starting HubSpot sync');
    const syncResult = await runFullSync();
    const healthResult = await calculateAllHealthScores();
    return NextResponse.json({ success: true, sync: syncResult, healthScores: healthResult });
  } catch (error) {
    logger.error('Sync failed', { error: String(error) });
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// Called by Vercel cron (Authorization: Bearer <CRON_SECRET>)
export async function POST(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return runSync();
}

// Manual trigger via browser: GET /api/v1/hubspot/sync?secret=<CRON_SECRET>
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && secret !== cronSecret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return runSync();
}
