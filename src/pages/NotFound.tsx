// ============================================================
// KrishiMitra OS — 404 Not Found Page
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-6 max-w-sm"
      >
        <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-forest-800/20 border border-emerald-500/20">
          <Leaf className="h-10 w-10 text-emerald-400 animate-float" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-gradient-emerald">404</h1>
          <p className="text-lg font-bold text-white">Page Not Found</p>
          <p className="text-sm text-slate-400">
            The field you're looking for doesn't exist. Let's get you back to
            productive ground.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/')}
        >
          Return to Farm Dashboard
        </Button>
      </motion.div>
    </main>
  );
}
