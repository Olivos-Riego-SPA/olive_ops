import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name            : 'Olive OPS',
    short_name      : 'OPS',
    description     : 'Centro de Comando Olive Operations',
    start_url       : '/dashboard',
    display         : 'standalone',
    background_color: '#0c1517',
    theme_color     : '#0c1517',
    orientation     : 'portrait',
    icons: [
      {
        src    : '/logos/OPSMin.png',
        sizes  : '259x259',
        type   : 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
