import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Routes with dynamic parameters should use client rendering
  {
    path: 'doctor/prescriptions/create/:appointmentId',
    renderMode: RenderMode.Client
  },
  // Patient routes
  {
    path: 'patient/**',
    renderMode: RenderMode.Client
  },
  // Doctor routes
  {
    path: 'doctor/**',
    renderMode: RenderMode.Client
  },
  // Hospital routes
  {
    path: 'hospital/**',
    renderMode: RenderMode.Client
  },
  // Admin routes
  {
    path: 'admin/**',
    renderMode: RenderMode.Client
  },
  // Home page can be prerendered
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  // All other routes use client rendering
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
