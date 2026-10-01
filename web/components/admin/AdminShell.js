"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/adminApi";
import ThemeToggle from "@/components/admin/ThemeToggle";

const THEME_KEY = "adtric_admin_theme";

const links = [
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/enquiries", label: "Enquiries" },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const isLogin = pathname === "/admin/login";
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let saved = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch {}
    if (saved !== "light" && saved !== "dark") {
      saved = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    setTheme(saved);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  };

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
  }, [isLogin, router]);

  const wrap = (content) => (
    <div
      data-theme={theme}
      className="admin-root min-h-screen"
      style={{ visibility: mounted ? "visible" : "hidden" }}
    >
      {content}
    </div>
  );

  if (isLogin) {
    return wrap(
      <>
        <div className="absolute right-5 top-5">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        {children}
      </>
    );
  }
  if (!ready) return wrap(<div className="p-10 text-muted">Loading...</div>);

  const logout = () => {
    clearToken();
    router.replace("/admin/login");
  };

  return wrap(
    <>
      <header className="border-b border-line/40 bg-bg">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex items-center gap-8">
            <Link href="/admin/projects" className="heading text-[22px] tracking-[0.2em]">
              ADTRIC <span className="eyebrow ml-2">Admin</span>
            </Link>
            <nav className="flex gap-6 text-[13px] uppercase tracking-[0.15em]">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={pathname.startsWith(link.href) ? "text-fg" : "text-muted hover:text-fg"}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-5 text-[13px] uppercase tracking-[0.15em]">
            <Link href="/" target="_blank" className="text-muted hover:text-fg">
              View site
            </Link>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button type="button" onClick={logout} className="btn btn-gray !px-5 !py-2">
              Log out
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1200px] px-5 py-10 md:px-8">{children}</div>
    </>
  );
}
