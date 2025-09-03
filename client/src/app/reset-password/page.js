"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ email: "", otp: "", password: "", confirm: "" });
  const [status, setStatus] = useState({ type: null, message: "" });
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const email = searchParams.get("email");
    if (email) {
      setForm((prev) => ({ ...prev, email }));
    }
  }, [searchParams]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });
    if (form.password !== form.confirm) {
      setStatus({ type: "error", message: "Passwords do not match" });
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(form.email, form.otp, form.password);
      setStatus({ type: "success", message: "Password has been reset. You can login now." });
      setTimeout(() => router.push("/login"), 1000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to reset password";
      setStatus({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-6">Reset Password</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm">Email</label>
          <Input type="email" name="email" value={form.email} onChange={onChange} required />
        </div>
        <div>
          <label className="block mb-2 text-sm">OTP</label>
          <Input type="text" name="otp" value={form.otp} onChange={onChange} placeholder="6-digit OTP" required />
        </div>
        <div>
          <label className="block mb-2 text-sm">New Password</label>
          <Input type="password" name="password" value={form.password} onChange={onChange} required />
        </div>
        <div>
          <label className="block mb-2 text-sm">Confirm Password</label>
          <Input type="password" name="confirm" value={form.confirm} onChange={onChange} required />
        </div>
        {status.message ? (
          <p className={`${status.type === "error" ? "text-red-600" : "text-green-600"} text-sm`}>
            {status.message}
          </p>
        ) : null}
        <Button disabled={loading} type="submit">
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}


