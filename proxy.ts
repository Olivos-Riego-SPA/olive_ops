import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import type { SessionData } from './lib/session';

export async function proxy(req: NextRequest) {
  const userAgent =
    req.headers.get('user-agent') ||
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';

  // Obtener sesión de IronSession (config inline — Edge Runtime no puede importar lib/session)
  const session = await getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET!,
    cookieName: 'olive_ops_session',
  });

  const response = session.user
    ? NextResponse.next()
    : NextResponse.redirect(new URL('/', req.url));

  // Inyectar user-agent como cookie para que fetch.ts lo pueda leer
  response.cookies.set({
    name: 'user-agent',
    value: userAgent,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'strict',
  });

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
