"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, LogOut, Menu, User, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

type RouteKey = "home" | "scanner" | "library" | "impact" | "community" | "profile";

const navItems: Array<{ id: RouteKey; label: string; href: string }> = [
  { id: "scanner", label: "Scanner", href: "/scanner" },
  { id: "library", label: "Library", href: "/library" },
  // { id: "impact", label: "Impact", href: "/impact" },
  { id: "community", label: "Community", href: "/community" },
  { id: "profile", label: "Profile", href: "/profile" },
];

export default function AppNav() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRouteKey = (path: string): RouteKey => {
    if (path.startsWith("/scanner")) return "scanner";
    if (path.startsWith("/library")) return "library";
    if (path.startsWith("/impact")) return "impact";
    if (path.startsWith("/community")) return "community";
    if (path.startsWith("/profile")) return "profile";
    return "home";
  };

  const activeRoute = getRouteKey(pathname);

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    try {
      let response: any;

      if (authMode === "sign-in") {
        response = await authClient.signIn.email({
          email: authEmail,
          password: authPassword,
        });
      } else {
        response = await authClient.signUp.email({
          name: authName,
          email: authEmail,
          password: authPassword,
        });
      }

      // Check if there's an error in the response
      if (response?.error) {
        const errorMessage = response.error.message || "Authentication failed.";
        setAuthError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Only show success and close modal if no error
      if (authMode === "sign-in") {
        toast.success("Signed in successfully!");
      } else {
        toast.success("Account created successfully!");
      }
      setIsAuthOpen(false);
      setAuthPassword("");
      setAuthEmail("");
      setAuthName("");
    } catch (error: any) {
      const errorMessage = error?.message || "Authentication failed.";
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    setIsMobileMenuOpen(false);
    toast.success("Signed out successfully!");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-510 bg-surface/80 backdrop-blur-xl border-b border-bark/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-24 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Image
                src={"/images/Unscrap Logo Text.png"}
                alt="Unscrap Logo"
                width={600}
                height={30}
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 font-bold uppercase text-primary text-sm">
            <Link
              href="/"
              className={
                activeRoute === "home"
                  ? "text-moss"
                  : "hover:text-moss transition-colors"
              }
            >
              Home
              {activeRoute === "home" && (
                <span className="block h-1 w-full bg-moss rounded-full mt-1" />
              )}
            </Link>
            {navItems.map((item) => {
              if (item.id === "library" && !session?.user) return null;
              if (item.id === "profile" && !session?.user) return null;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={
                    activeRoute === item.id
                      ? "text-moss"
                      : "hover:text-moss transition-colors"
                  }
                >
                  {item.label}
                  {activeRoute === item.id && (
                    <span className="block h-1 w-full bg-moss rounded-full mt-1" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* <div className="hidden sm:flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
            <span>{isPending ? 'Loading session' : 'Explore the 3R Lab'}</span>
          </div> */}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="inline-flex md:hidden items-center justify-center rounded-xl border border-bark/20 bg-surface px-3 py-2 text-primary"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {session?.user ? (
              <div className="flex items-center gap-3 rounded-2xl border border-bark/10 bg-surface/90 px-4 py-3 shadow-lg backdrop-blur-xl">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                    Signed in
                  </span>
                  <span className="text-xs font-bold text-ink">
                    {session.user.name || session.user.email}
                  </span>
                </div>
                <Link
                  href="/profile"
                  className="p-2 text-muted hover:text-moss transition-colors"
                  aria-label="Edit profile"
                >
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-muted hover:text-red-500 transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode("sign-in");
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

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-500 bg-black/35 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="absolute inset-x-4 top-24 rounded-3xl border border-bark/10 bg-page-bg p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-2 text-sm font-bold uppercase tracking-wide text-primary">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={activeRoute === "home" ? "rounded-xl bg-sprout/20 px-4 py-3 text-moss" : "rounded-xl px-4 py-3 hover:bg-sprout/10"}
              >
                Home
              </Link>

              {navItems.map((item) => {
                if (item.id === "library" && !session?.user) return null;
                if (item.id === "profile" && !session?.user) return null;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={
                      activeRoute === item.id
                        ? "rounded-xl bg-sprout/20 px-4 py-3 text-moss"
                        : "rounded-xl px-4 py-3 hover:bg-sprout/10"
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {!session?.user && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setAuthMode("sign-in");
                  setIsAuthOpen(true);
                }}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20"
              >
                <UserPlus className="w-4 h-4" /> Sign In
              </button>
            )}
          </div>
        </div>
      )}

      {isAuthOpen && (
        <div className="fixed inset-0 z-150 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-4xl bg-linear-to-b from-white to-page-bg border border-bark/10 shadow-2xl p-6">
            <div className="flex relative justify-between gap-4 mb-6">
              <div className="mx-auto">
                <h2 className="text-2xl font-bold text-primary flex items-center">
                  <Leaf className="w-6 h-6 inline-block text-moss mr-2" />
                  {authMode === "sign-in" ? "Welcome Back!" : "Create an Account"}
                </h2>
              </div>
              <button
                onClick={() => setIsAuthOpen(false)}
                className="absolute top-0 right-0 text-sm font-bold text-muted hover:text-ink transition-colors"
              >
                <X color="#5c4033"/>
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "sign-up" && (
                <input
                  value={authName}
                  onChange={(event) => setAuthName(event.target.value)}
                  placeholder="Display Name"
                  className="w-full rounded-2xl border border-bark/40 bg-white px-4 py-3 text-sm font-medium text-ink outline-none focus:border-moss"
                />
              )}
              <input
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                type="email"
                placeholder="Email"
                className="w-full rounded-2xl border border-bark/40 bg-white px-4 py-3 text-sm font-medium text-ink outline-none focus:border-moss"
              />
              <input
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                type="password"
                placeholder="Password"
                className="w-full rounded-2xl border border-bark/40 bg-white px-4 py-3 text-sm font-medium text-ink outline-none focus:border-moss"
              />

              {authError && (
                <p className="text-sm font-medium text-red-600">{authError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting
                  ? "Working..."
                  : authMode === "sign-in"
                    ? "Sign In"
                    : "Sign Up"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setAuthMode(authMode === "sign-in" ? "sign-up" : "sign-in");
                }}
                className="w-full text-sm font-bold text-moss hover:underline"
              >
                {authMode === "sign-in" ? (
                  <>
                    Need an account? <span className="underline">Sign up</span>
                  </>
                ) : (
                  <>
                    Already have an account? <span className="underline">Sign in</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
