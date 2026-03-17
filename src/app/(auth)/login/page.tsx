'use client';

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Supabase auth will be wired later
    console.log('Login attempt:', { email });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4">
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
            <p className="text-sm text-slate-400 mt-2">Sign in to continue</p>
          </div>

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
            <Button type="submit" className="w-full mt-2">
              Sign In
            </Button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-6">
            Access is invite-only. Contact your admin.
          </p>
        </div>
      </div>
    </div>
  );
}
