"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

function ArtworkPanel() {
  return (
    <div className="relative hidden h-full w-full overflow-hidden bg-card lg:block">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating monospace text decoration */}
      <div className="absolute inset-0 flex flex-col justify-between p-10">
        <div>
          <div className="font-mono text-xs text-muted-foreground/40 leading-relaxed select-none">
            <p>// null-web</p>
          </div>
        </div>

        {/* Central branding */}
        <div className="flex flex-col items-start gap-4">
          <div className="font-mono text-6xl font-bold tracking-tighter text-foreground/90">
            null
          </div>
          <div className="h-px w-24 bg-border" />
          <p className="max-w-xs font-mono text-xs leading-relaxed text-muted-foreground/60">
            personal finance tracking
          </p>
        </div>

        {/* Bottom decoration */}
        <div className="font-mono text-[10px] text-muted-foreground/30 select-none">
          vX.X.X
        </div>
      </div>

      {/* Subtle accent gradient in corner */}
      <div
        className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full opacity-[0.06] blur-3xl"
        style={{ backgroundColor: "oklch(0.6076 0.1561 305.32)" }}
      />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data?.user) {
          router.push("/");
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (mode === "register") {
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, displayName: name }),
        });
        if (!response.ok) throw new Error((await response.json()).error || "Registration failed");
      }

      const result = await authClient.signIn.email({ email, password });
      if (result.error) throw new Error("Invalid email or password");

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
  };

  if (isLoggedIn === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="font-mono text-sm text-muted-foreground">checking session...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left: Artwork */}
      <div className="hidden lg:flex lg:w-1/2">
        <ArtworkPanel />
      </div>

      {/* Right: Form */}
      <div className="flex w-full flex-col justify-center px-6 lg:w-1/2 lg:px-0">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile-only branding */}
          <div className="mb-8 lg:hidden">
            <div className="font-mono text-2xl font-bold tracking-tighter text-foreground">null</div>
          </div>

          {/* Header */}
          <header className="mb-8">
            <h1 className="font-mono text-xs font-normal tracking-wide text-muted-foreground">
              {mode === "login" ? "welcome back" : "create account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground/60">
              {mode === "login"
                ? "sign in to access your financial data"
                : "set up your account to start tracking"}
            </p>
          </header>

          {/* Mode toggle */}
          <div className="mb-6 flex gap-1 border-b border-border">
            <button
              onClick={() => switchMode("login")}
              className={`pb-2 font-mono text-xs transition-colors duration-150 ${mode === "login"
                  ? "border-b border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
                }`}
              style={{ marginBottom: "-1px" }}
            >
              login
            </button>
            <button
              onClick={() => switchMode("register")}
              className={`ml-4 pb-2 font-mono text-xs transition-colors duration-150 ${mode === "register"
                  ? "border-b border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
                }`}
              style={{ marginBottom: "-1px" }}
            >
              sign up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="font-mono text-xs text-muted-foreground">
                  name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="your display name"
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-mono text-xs text-muted-foreground">
                email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="font-mono text-xs text-muted-foreground">
                password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "login" ? "your password" : "create a password"}
                disabled={isLoading}
                required
              />
            </div>

            <Button type="submit" className="mt-2 w-full" size="lg" disabled={isLoading}>
              {isLoading
                ? mode === "login"
                  ? "signing in..."
                  : "creating account..."
                : mode === "login"
                  ? "sign in"
                  : "create account"}
            </Button>
          </form>

          {error && (
            <div className="mt-4 border border-destructive/30 p-3 font-mono text-xs text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
