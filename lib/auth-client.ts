'use client';

/**
 * Función de logout para usar en componentes cliente.
 * Cierra la sesión y redirige al login.
 */
export async function signOut() {
  try {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (response.ok) {
      window.location.replace(window.location.origin + '/');
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    window.location.replace(window.location.origin + '/');
  }
}
