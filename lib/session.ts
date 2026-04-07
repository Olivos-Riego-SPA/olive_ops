'use server';

import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { logScanService } from '@/services/session-scan/service';
import { OpsScanModule, ScanActionType } from '@/types/session-scan';

// 🔒 Control de refresh en progreso
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// Configuración de tiempos de token
const REFRESH_THRESHOLD_MINUTES = 5;  // Refrescar cuando queden 5 min
const REFRESH_TOKEN_MIN_MINUTES = 10; // Refresh token mínimo: 10 min

/**
 * Interfaz de datos de sesión
 */
export interface SessionData {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    token: string;
    refreshToken: string;
    // Timestamps calculados (en milisegundos)
    tokenExpires: number;
    refreshTokenExpires: number;
    // Datos originales de la API
    accessTokenExpiresAt: string;
    accessTokenExpiresIn: string;
    refreshTokenExpiresAt: string;
    refreshTokenExpiresIn: string;
    isAdmin: boolean;
    isReadOnlyAdmin: boolean;
    zenoSamaMode: boolean;
    scanSessionId?: string;
  };
}

/**
 * Configuración de IronSession
 */
const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'olive_ops_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 días
    path: '/',
  },
};

/**
 * Obtiene la sesión actual
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

/**
 * Verifica si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session.user;
}

/**
 * Calcula cuánto tiempo falta para que expire el token
 */
function getTimeLeftInMinutes(expiresTimestamp: number): number {
  const timeLeft = expiresTimestamp - Date.now();
  return Math.floor(timeLeft / 60000);
}

/**
 * Determina si debemos refrescar el access token preventivamente
 */
function shouldRefreshAccessToken(session: SessionData): boolean {
  if (!session.user) return false;

  const accessTokenMinutesLeft = getTimeLeftInMinutes(session.user.tokenExpires);
  const refreshTokenMinutesLeft = getTimeLeftInMinutes(session.user.refreshTokenExpires);

  const refreshTokenIsValid = refreshTokenMinutesLeft > REFRESH_TOKEN_MIN_MINUTES;
  const accessTokenNeedsRefresh = accessTokenMinutesLeft < REFRESH_THRESHOLD_MINUTES;

  if (accessTokenNeedsRefresh && !refreshTokenIsValid) {
    console.warn(`⚠️ Access token necesita refresh pero refresh token está por expirar (${refreshTokenMinutesLeft} min)`);
    return false;
  }

  return accessTokenNeedsRefresh && refreshTokenIsValid;
}

/**
 * Obtiene el token de acceso actual (con refresh preventivo)
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();

  if (!session.user) {
    return null;
  }

  const requestId = Math.random().toString(36).substring(7);

  if (isRefreshing && refreshPromise) {
    console.log(`⏳ [${requestId}] Esperando a que termine el refresh en progreso...`);
    await refreshPromise;
    console.log(`✅ [${requestId}] Refresh completado, usando nuevo token`);
    const updatedSession = await getSession();
    return updatedSession.user?.token || null;
  }

  if (shouldRefreshAccessToken(session)) {
    const accessMinutesLeft = getTimeLeftInMinutes(session.user.tokenExpires);
    const refreshMinutesLeft = getTimeLeftInMinutes(session.user.refreshTokenExpires);

    console.log(`⏰ [${requestId}] Refresh preventivo:`);
    console.log(`   Access Token: ${accessMinutesLeft} min restantes`);
    console.log(`   Refresh Token: ${refreshMinutesLeft} min restantes`);

    await refreshAccessTokenWithLock();

    console.log(`✅ [${requestId}] Token actualizado, usando nuevo token`);

    const updatedSession = await getSession();
    return updatedSession.user?.token || null;
  }

  return session.user.token;
}

/**
 * Wrapper que controla el acceso a refreshAccessToken con lock
 */
async function refreshAccessTokenWithLock(): Promise<void> {
  if (isRefreshing && refreshPromise) {
    console.log('⏳ Ya hay un refresh en curso, esperando...');
    await refreshPromise;
    return;
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken()
    .then(() => {
      isRefreshing = false;
      refreshPromise = null;
    })
    .catch((error) => {
      isRefreshing = false;
      refreshPromise = null;
      throw error;
    });

  await refreshPromise;
}

/**
 * Helper: Parsea el texto descriptivo de expiración (ej: "3 hours") a milisegundos
 */
function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/(\d+)\s*(hour|minute|day|second)/i);
  if (!match) {
    console.warn(`⚠️ No se pudo parsear expiresIn: "${expiresIn}", usando 3 horas por defecto`);
    return 3 * 60 * 60 * 1000;
  }

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  if (unit.startsWith('second')) return value * 1000;
  if (unit.startsWith('minute')) return value * 60 * 1000;
  if (unit.startsWith('hour'))   return value * 60 * 60 * 1000;
  if (unit.startsWith('day'))    return value * 24 * 60 * 60 * 1000;

  return 3 * 60 * 60 * 1000;
}

/**
 * Refresca el token de acceso
 */
async function refreshAccessToken(): Promise<void> {
  const session = await getSession();

  if (!session.user || !session.user.refreshToken || !session.user.id) {
    throw new Error('🔴 Faltan datos para renovar token');
  }

  try {
    console.log('🔄 Renovando token...');

    const url = `${process.env.API_URL}/auth/refresh`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: session.user.refreshToken,
        userId: session.user.id,
      }),
    });

    if (!response.ok) {
      console.error('🔴 Error al renovar token:', response.status);
      throw new Error(`Refresh token failed: ${response.status}`);
    }

    const refreshData = await response.json();

    if (!refreshData.accessToken) {
      console.error('🔴 Respuesta inválida del servidor');
      throw new Error('Respuesta inválida del servidor');
    }

    const now = Date.now();

    session.user.token = refreshData.accessToken;

    if (refreshData.refreshToken) {
      session.user.refreshToken = refreshData.refreshToken;
      console.log('🔄 Refresh token también actualizado');
    }

    if (refreshData.accessTokenExpiresAt) {
      session.user.tokenExpires = new Date(refreshData.accessTokenExpiresAt).getTime();
      session.user.accessTokenExpiresAt = refreshData.accessTokenExpiresAt;
    } else if (refreshData.accessTokenExpiresIn) {
      const milliseconds = parseExpiresIn(refreshData.accessTokenExpiresIn);
      session.user.tokenExpires = now + milliseconds;
    }

    if (refreshData.accessTokenExpiresIn) {
      session.user.accessTokenExpiresIn = refreshData.accessTokenExpiresIn;
    }

    if (refreshData.refreshTokenExpiresAt) {
      session.user.refreshTokenExpires = new Date(refreshData.refreshTokenExpiresAt).getTime();
      session.user.refreshTokenExpiresAt = refreshData.refreshTokenExpiresAt;
    } else if (refreshData.refreshTokenExpiresIn) {
      const milliseconds = parseExpiresIn(refreshData.refreshTokenExpiresIn);
      session.user.refreshTokenExpires = now + milliseconds;
    }

    if (refreshData.refreshTokenExpiresIn) {
      session.user.refreshTokenExpiresIn = refreshData.refreshTokenExpiresIn;
    }

    await session.save();

    // Fire-and-forget: log token refresh
    logScanService({
      sessionId: session.user!.scanSessionId ?? '',
      userId: session.user!.id,
      userEmail: session.user!.email ?? '',
      userRole: {
        isAdmin: session.user!.isAdmin,
        isReadOnlyAdmin: session.user!.isReadOnlyAdmin,
        zenoSamaMode: session.user!.zenoSamaMode,
      },
      scanModule: OpsScanModule.OPS_SESSION,
      action: 'ops.session.refresh',
      actionType: ScanActionType.REFRESH,
      description: 'Renovación de token en Olive Ops',
    }).catch(() => {});

    console.log('✅ Token renovado exitosamente');
    console.log(`   Access Token expira: ${session.user.accessTokenExpiresIn || 'N/A'}`);
    if (refreshData.refreshToken) {
      console.log(`   Refresh Token expira: ${session.user.refreshTokenExpiresIn || 'N/A'}`);
    }
  } catch (error) {
    console.error('🔴 Error al renovar token:', error);
    await session.destroy();
    throw error;
  }
}

/**
 * Obtiene el usuario de la sesión
 */
export async function getSessionUser() {
  const session = await getSession();
  return session.user || null;
}

/**
 * Cierra la sesión del usuario
 */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  await session.destroy();
}
