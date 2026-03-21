/**
 * Shown when VITE_SUPABASE_* env vars were not available at build time
 * (e.g. missing in Vercel → Settings → Environment Variables).
 */
const MissingSupabaseConfig = () => (
  <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
    <div className="max-w-lg rounded-xl border border-border bg-card p-8 shadow-lg space-y-4">
      <h1 className="text-xl font-semibold">App configuration missing</h1>
      <p className="text-muted-foreground text-sm leading-relaxed">
        This build does not include <code className="text-xs bg-muted px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> or{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">VITE_SUPABASE_PUBLISHABLE_KEY</code>. Vite bakes these in at{" "}
        <strong>build</strong> time — add them in Vercel → Project → Settings → Environment Variables (Production), then{" "}
        <strong>Redeploy</strong>.
      </p>
      <p className="text-muted-foreground text-sm">
        Also confirm <strong>Deployment Protection</strong> is not blocking public visitors (Vercel may show a login wall
        instead of this app).
      </p>
    </div>
  </div>
);

export default MissingSupabaseConfig;
