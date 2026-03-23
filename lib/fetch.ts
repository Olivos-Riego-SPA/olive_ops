'use server';

import { getUserAgent } from '@/actions/helper/user-agent';
import { getAccessToken } from './session';
import { FetchResponse } from '@/types';
import { redirect } from 'next/navigation';

/**
 * Función principal de fetch que maneja todas las peticiones a la API.
 * Incluye refresh preventivo de tokens automático.
 */
async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<FetchResponse> {
  const url = `${process.env.API_URL}${endpoint}`;
  const userAgent = await getUserAgent();

  // Obtener token (con refresh preventivo automático si es necesario)
  // Solo si NO es la ruta de login
  const token = endpoint === '/auth/login' ? null : await getAccessToken();

  // Si no hay token y no es login, redirigir
  if (!token && endpoint !== '/auth/login') {
    redirect('/');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'User-Agent': userAgent,
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Si es 401 a pesar del refresh preventivo, es un error fatal
    if (response.status === 401 && endpoint !== '/auth/login') {
      console.error('❌ 401 a pesar del refresh preventivo - sesión inválida');
      redirect('/');
    }

    const data = await response.json().catch(() => null);

    return {
      code: response.status,
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : (data?.message || data || 'Error en la petición'),
    };
  } catch (error: any) {
    console.error('Error en fetchApi:', error);
    return {
      code: 0,
      error: error.message || 'Error de conexión',
    };
  }
}

export async function getApi(endpoint: string, options: RequestInit = {}): Promise<FetchResponse> {
  return fetchApi(endpoint, { ...options, method: 'GET' });
}

export async function postApi(endpoint: string, body: any, options: RequestInit = {}): Promise<FetchResponse> {
  return fetchApi(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined });
}

export async function putApi(endpoint: string, body: any, options: RequestInit = {}): Promise<FetchResponse> {
  return fetchApi(endpoint, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined });
}

export async function deleteApi(endpoint: string, options: RequestInit = {}): Promise<FetchResponse> {
  return fetchApi(endpoint, { ...options, method: 'DELETE' });
}

export async function patchApi(endpoint: string, body: any, options: RequestInit = {}): Promise<FetchResponse> {
  return fetchApi(endpoint, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
}
