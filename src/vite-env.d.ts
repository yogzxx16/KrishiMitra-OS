/// <reference types="vite/client" />

// ─── Vite Env Variable Types ──────────────────────────────────────────────────

interface ImportMetaEnv {
  readonly VITE_GROQ_API_KEY: string | undefined;
  readonly VITE_SUPABASE_URL: string | undefined;
  readonly VITE_SUPABASE_ANON_KEY: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ─── Web Speech API Types ─────────────────────────────────────────────────────

interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}
