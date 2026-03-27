// ============================================================
// Este endpoint ya no se usa.
// Los productos ahora se cargan directamente desde WP Local + ACF
// a través de src/lib/wordpress.ts usando la REST API estándar.
// Se mantiene este archivo vacío para evitar errores 404 en
// referencias legacy.
// ============================================================

import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    success: false,
    message: 'Este endpoint está deprecado. Los productos se cargan directamente desde WordPress Local + ACF.',
  }), {
    status: 410,
    headers: { 'Content-Type': 'application/json' },
  });
};
