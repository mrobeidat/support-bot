import { NextRequest, NextResponse } from 'next/server';

const sessions = new Map<string, unknown[]>();

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (sessionId) {
      sessions.delete(sessionId);
    }

    return NextResponse.json({
      success: true,
      message: 'Session cleared',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to reset session' }, { status: 500 });
  }
}
