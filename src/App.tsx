// ============================================================
// KrishiMitra OS — App Root: Router + Providers
// ============================================================

import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/layout/Header';
import { FloatingVoiceController } from './components/voice/FloatingVoiceController';
import { VoiceProvider } from './contexts/VoiceContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAppStore } from './store/appStore';

// Lazy-loaded pages
const Login = lazy(() => import('./pages/Login'));
const FarmerHome = lazy(() => import('./pages/FarmerHome'));
const FPODashboard = lazy(() => import('./pages/FPODashboard'));
const GovTelemetry = lazy(() => import('./pages/GovTelemetry'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ─── Query Client ─────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 minutes
      gcTime: 10 * 60 * 1000,     // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Page Suspense Fallback ───────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading…</p>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <VoiceProvider>
          <BrowserRouter>
            <div className="min-h-dvh bg-[var(--color-bg-body)]">
              <Header />
              <AnimatePresence mode="wait">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route 
                      path="/" 
                      element={
                        <ProtectedRoute allowedRoles={['farmer', 'government']}>
                          <FarmerHome />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/fpo" 
                      element={
                        <ProtectedRoute allowedRoles={['fpo', 'government']}>
                          <FPODashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/gov" 
                      element={
                        <ProtectedRoute allowedRoles={['government']}>
                          <GovTelemetry />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </AnimatePresence>
              <FloatingVoiceController />
            </div>
          </BrowserRouter>
        </VoiceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
