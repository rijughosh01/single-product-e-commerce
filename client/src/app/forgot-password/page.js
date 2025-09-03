"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: null, message: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [cooldown, setCooldown] = useState(0);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  useEffect(() => {
    if (!cooldown) return;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setStatus({ type: "success", message: "OTP sent to your email." });
      setCooldown(60);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to send OTP";
      setStatus({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-input bg-background p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Forgot Password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your account email and we&apos;ll send a 6‑digit OTP to reset your
          password.
        </p>

        <form onSubmit={onSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block mb-2 text-sm">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            {!emailValid && email.length > 0 ? (
              <p className="text-xs text-red-600 mt-1">Enter a valid email.</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                We&apos;ll never share your email.
              </p>
            )}
          </div>

          {status.message ? (
            <div
              className={`text-sm rounded-md px-3 py-2 ${
                status.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
              }`}
            >
              {status.message}
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <Button disabled={loading || !emailValid || cooldown > 0} type="submit" className="flex-1">
              {loading ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Send OTP"}
            </Button>
            {status.type === "success" ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
              >
                Enter OTP
              </Button>
            ) : null}
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Didn&apos;t get the email? Check your spam folder or try again.
          </p>
        </form>
      </div>
    </div>
  );
}


