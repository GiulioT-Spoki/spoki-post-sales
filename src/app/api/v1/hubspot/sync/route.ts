import { NextRequest, NextResponse } from 'next/server';
import { runFullSync } from '@/lib/hubspot/sync';
import { calculateAllHealthScores } from '@/lib/health-score/calculator';
import { verifyCronRequest } from '@/lib/api/middleware';
import { getLogger } from '@/lib/logger';

const logger = getLogger('api:hubspot:sync');

export async function POST(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    logger.info('Starting scheduled HubSpot sync');
    const syncResult = await runFullSync();
    const healthResult = await calculateAllHealthScores();

    return NextResponse.json({
      success: true,
      sync: syncResult,
      healthScores: healthResult,
    });
  } catch (error) {
    logger.error('Sync endpoint failed', { error: String(error) });
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// Allow GET with secret for manual trigger
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const cronSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV === 'production' && (!cronSecret || secret !== cronSecret)) {
    return NextResponse.json({ success: false, error: 'Missing or invalid secret' }, { status: 401 });
  }
  return POST(request);
}
