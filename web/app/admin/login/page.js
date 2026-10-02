"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch, getToken, setToken } from "@/lib/adminApi";

export default function AdminLogin() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace("/admin/projects");
  }, [router]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!values.email.trim() || !values.password) {
      setError("Enter your email and password");
      return;
    }
    setLoading(true);
    const result = await adminFetch("/login", { method: "POST", json: values });
    setLoading(false);
    if (!result.ok) {
      setError(result.body.message || "Login failed");
      return;
    }
    setToken(result.body.data.token, result.body.data.email);
    router.replace("/admin/projects");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={submit} noValidate className="w-full max-w-[420px] bg-surface p-8 shadow-sm md:p-10">
        <p className="eyebrow">ADTRIC Super Admin</p>
        <h1 className="heading mt-3 text-[34px]">Sign in</h1>

        <div className="mt-8">
          <label htmlFor="email" className="field-label">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            className="field-input"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
          />
        </div>
        <div className="mt-6">
          <label htmlFor="password" className="field-label">Password</label>
          <div className="relative">
            <input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              className="field-input !pr-10"
              value={values.password}
              onChange={(e) => setValues({ ...values, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShow((value) => !value)}
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-fg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
                {show && <path d="M3 3l18 18" />}
              </svg>
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="field-error mt-5">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn btn-white mt-8 w-full">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
