'use server';

import { postApi } from '@/lib/fetch';

export async function loginService(email: string, password: string, locale: string) {
  try {
    const loginData = { email, password, locale };
    const datos = await postApi('/auth/login', loginData);

    if (!datos || !datos.data.userInfo || !datos.data.tokens) {
      throw new Error('Invalid email or password');
    }

    return {
      id: datos.data.userInfo._id,
      name: datos.data.userInfo.name,
      email: datos.data.userInfo.email,
      token: datos.data.tokens.accessToken,
      refreshToken: datos.data.tokens.refreshToken,
      accessTokenExpiresAt: datos.data.tokens.accessTokenExpiresAt,
      accessTokenExpiresIn: datos.data.tokens.accessTokenExpiresIn,
      refreshTokenExpiresAt: datos.data.tokens.refreshTokenExpiresAt,
      refreshTokenExpiresIn: datos.data.tokens.refreshTokenExpiresIn,
      isAdmin: datos.data.userInfo.isAdmin || false,
      isReadOnlyAdmin: datos.data.userInfo.isReadOnlyAdmin || false,
      zenoSamaMode: datos.data.userInfo.zenoSamaMode || false,
    };
  } catch (error) {
    console.error(error);
    throw new Error('Authentication failed');
  }
}
