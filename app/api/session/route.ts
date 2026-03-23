import { getSessionUser } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await getSessionUser();
    return NextResponse.json({
      session: user ? { user } : null,
    });
  } catch (error) {
    return NextResponse.json({ session: null }, { status: 200 });
  }
}
