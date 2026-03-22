/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_PROJECT_ID?: string;
  /** Production site origin for Supabase email redirects, e.g. https://chetti.vercel.app */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
