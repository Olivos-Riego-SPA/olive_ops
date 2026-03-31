'use server';

import { loginService } from '@/services/auth/authService';
import { getSession } from '@/lib/session';

const ALLOWED_DOMAINS = ['@olivos.cl', '@olivosirrigation.com'];

export async function loginAction(email: string, password: string, locale: string) {
  if (!ALLOWED_DOMAINS.some(d => email.toLowerCase().endsWith(d))) {
    throw new Error('Unauthorized domain');
  }

  try {
    const data = await loginService(email, password, locale);
    console.log('🌐 Respuesta de login recibida:', data);

    const accessTokenExpires = new Date(data.accessTokenExpiresAt).getTime();
    const refreshTokenExpires = new Date(data.refreshTokenExpiresAt).getTime();

    console.log('🔐 Login exitoso:');
    console.log(`  Access Token expira: ${data.accessTokenExpiresIn} (${new Date(accessTokenExpires).toLocaleString()})`);
    console.log(`  Refresh Token expira: ${data.refreshTokenExpiresIn} (${new Date(refreshTokenExpires).toLocaleString()})`);

    const session = await getSession();
    session.user = {
      id: data.id,
      name: data.name,
      email: data.email,
      token: data.token,
      refreshToken: data.refreshToken,
      tokenExpires: accessTokenExpires,
      refreshTokenExpires: refreshTokenExpires,
      accessTokenExpiresAt: data.accessTokenExpiresAt,
      accessTokenExpiresIn: data.accessTokenExpiresIn,
      refreshTokenExpiresAt: data.refreshTokenExpiresAt,
      refreshTokenExpiresIn: data.refreshTokenExpiresIn,
      isAdmin: data.isAdmin || false,
      isReadOnlyAdmin: data.isReadOnlyAdmin || false,
      zenoSamaMode: data.zenoSamaMode || false,
    };

    await session.save();

    return data;
  } catch (error) {
    throw new Error('Login failed');
  }
}
