'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const domainError = searchParams.get('error') === 'unauthorized_domain';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Enforce domain client-side
    if (!email.endsWith('@ambrosiaventures.co')) {
      setError('Only @ambrosiaventures.co email addresses are allowed.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-sm">
        <div className="card-elevated rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/logo-reversed.png"
                alt="Ambrosia Ventures"
                className="h-9 w-auto"
              />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="badge badge-teal text-[10px] font-semibold tracking-wider">
                OPS
              </span>
            </div>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Sign in to continue</p>
          </div>

          {(error || domainError) && (
            <div className="mb-5 rounded-lg px-4 py-3 text-[13px]" style={{
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)',
              color: '#f87171',
            }}>
              {domainError ? 'Only @ambrosiaventures.co emails are authorized.' : error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@ambrosiaventures.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: '#334155' }}>
            Ambrosia Ventures team members only.
          </p>
        </div>
      </div>
    </div>
  );
}
