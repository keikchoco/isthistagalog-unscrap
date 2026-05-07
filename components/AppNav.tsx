'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Trash2, UserPlus } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

type RouteKey = 'home' | 'scanner' | 'suggestions' | 'impact' | 'community';

const navItems: Array<{ id: RouteKey; label: string; href: string }> = [
  { id: 'scanner', label: 'Scanner', href: '/scanner' },
  { id: 'suggestions', label: 'Suggestions', href: '/suggestions' },
  { id: 'impact', label: 'Impact', href: '/impact' },
  { id: 'community', label: 'Community', href: '/community' },
];

export default function AppNav() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRouteKey = (path: string): RouteKey => {
    if (path.startsWith('/scanner')) return 'scanner';
    if (path.startsWith('/suggestions')) return 'suggestions';
    if (path.startsWith('/impact')) return 'impact';
    if (path.startsWith('/community')) return 'community';
    return 'home';
  };

  const activeRoute = getRouteKey(pathname);

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    try {
      if (authMode === 'sign-in') {
        await authClient.signIn.email({
          email: authEmail,
          password: authPassword,
        });
      } else {
        await authClient.signUp.email({
          name: authName,
          email: authEmail,
          password: authPassword,
        });
      }

      setIsAuthOpen(false);
      setAuthPassword('');
    } catch (error: any) {
      setAuthError(error?.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-surface/80 backdrop-blur-xl border-b border-bark/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group shrink-0">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Trash2 className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-ink">Unscrap</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            <Link href="/" className={activeRoute === 'home' ? 'text-moss' : 'hover:text-moss transition-colors'}>
              Home
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={activeRoute === item.id ? 'text-moss' : 'hover:text-moss transition-colors'}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            <span>{isPending ? 'Loading session' : 'Explore the 3R Lab'}</span>
          </div>

          <div className="flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-3 rounded-2xl border border-bark/10 bg-surface/90 px-4 py-3 shadow-lg backdrop-blur-xl">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">Signed in</span>
                  <span className="text-xs font-bold text-ink">{session.user.name || session.user.email}</span>
                </div>
                <button onClick={handleLogout} className="p-2 text-muted hover:text-red-500 transition-colors" aria-label="Sign out">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('sign-in');
                  setIsAuthOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {isAuthOpen && (
        <div className="fixed inset-0 z-[150] bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-[32px] bg-surface border border-bark/10 shadow-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted">Better Auth</p>
                <h2 className="text-2xl font-bold text-ink">{authMode === 'sign-in' ? 'Welcome back' : 'Create account'}</h2>
              </div>
              <button onClick={() => setIsAuthOpen(false)} className="text-sm font-bold text-muted hover:text-ink transition-colors">
                Close
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'sign-up' && (
                <input
                  value={authName}
                  onChange={(event) => setAuthName(event.target.value)}
                  placeholder="Display name"
                  className="w-full rounded-2xl border border-bark/10 bg-white px-4 py-3 text-sm font-medium text-ink outline-none focus:border-moss"
                />
              )}
              <input
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                type="email"
                placeholder="Email"
                className="w-full rounded-2xl border border-bark/10 bg-white px-4 py-3 text-sm font-medium text-ink outline-none focus:border-moss"
              />
              <input
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                type="password"
                placeholder="Password"
                className="w-full rounded-2xl border border-bark/10 bg-white px-4 py-3 text-sm font-medium text-ink outline-none focus:border-moss"
              />

              {authError && <p className="text-sm font-medium text-red-600">{authError}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Working...' : authMode === 'sign-in' ? 'Sign In' : 'Create Account'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setAuthMode(authMode === 'sign-in' ? 'sign-up' : 'sign-in');
                }}
                className="w-full text-sm font-bold text-moss hover:underline"
              >
                {authMode === 'sign-in' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}