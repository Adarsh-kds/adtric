"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getEmail, getToken } from "@/lib/adminApi";
import ThemeToggle from "@/components/admin/ThemeToggle";
import AdminIcon from "@/components/admin/AdminIcon";
import AdminSidebar from "@/components/admin/AdminSidebar";

const THEME_KEY = "adtric_admin_theme";

// Sample notifications for the interface. They are not connected to live data yet.
const notifications = [
  { title: "New enquiry received", text: "ABA Cleo County", time: "5 min ago", unread: true },
  { title: "CRM push failed", text: "One enquiry is waiting for a retry", time: "1 hour ago", unread: true },
  { title: "Property published", text: "DLF Camellias is now live", time: "Yesterday", unread: true },
  { title: "Weekly summary ready", text: "Enquiries and site visits", time: "2 days ago", unread: false },
];

const getCrumbs = (pathname) => {
  if (pathname.startsWith("/admin/enquiries")) return ["Manage", "Enquiries"];
  if (pathname.endsWith("/new")) return ["Manage", "Properties", "Add property"];
  if (pathname.endsWith("/edit")) return ["Manage", "Properties", "Edit property"];
  return ["Manage", "Properties"];
};

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(null);
  const [email, setEmail] = useState("");
  const menuRef = useRef(null);

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

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }
    setEmail(getEmail());
    setReady(true);
  }, [isLogin, router]);

  useEffect(() => {
    setDrawer(false);
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    const close = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "mousedown" && menuRef.current && menuRef.current.contains(event.target)) return;
      setMenu(null);
      if (event.type === "keydown") setDrawer(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  };

  const wrap = (content) => (
    <div data-theme={theme} className="admin-root min-h-screen" style={{ visibility: mounted ? "visible" : "hidden" }}>
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

  const crumbs = getCrumbs(pathname);
  const unread = notifications.filter((item) => item.unread).length;
  const initial = (email || "A").charAt(0).toUpperCase();

  return wrap(
    <>
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line/30 bg-surface lg:flex">
        <div className="flex h-14 shrink-0 items-center border-b border-line/30 px-6">
          <Link href="/admin/projects" className="heading text-[21px] tracking-[0.18em]">
            ADTRIC
            <span className="eyebrow ml-2 !text-[10px] !tracking-[0.3em]">Admin</span>
          </Link>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto">
          <AdminSidebar />
        </div>
        <div className="flex items-center gap-3 border-t border-line/30 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-button text-[14px]">{initial}</span>
          <div className="min-w-0 leading-tight">
            <p className="text-[14px]">Super Admin</p>
            <p className="truncate text-[12px] text-muted">{email || "admin"}</p>
          </div>
        </div>
      </aside>

      {/* Sidebar (mobile drawer) */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/55" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[272px] max-w-[85%] flex-col bg-surface">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-line/30 pl-6 pr-3">
              <span className="heading text-[21px] tracking-[0.18em]">ADTRIC</span>
              <button type="button" aria-label="Close menu" className="admin-icon-btn" onClick={() => setDrawer(false)}>
                <AdminIcon name="close" />
              </button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto">
              <AdminSidebar onNavigate={() => setDrawer(false)} />
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line/30 bg-bg/95 px-4 backdrop-blur md:px-6">
          <button type="button" aria-label="Open menu" className="admin-icon-btn lg:hidden" onClick={() => setDrawer(true)}>
            <AdminIcon name="menu" />
          </button>

          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-[13px] text-muted sm:flex">
            {crumbs.map((crumb, index) => (
              <span key={crumb} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden="true">/</span>}
                <span className={index === crumbs.length - 1 ? "text-fg" : ""}>{crumb}</span>
              </span>
            ))}
          </nav>

          <div className="relative ml-auto hidden w-full max-w-[320px] md:block">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <AdminIcon name="search" size={16} />
            </span>
            <input
              type="search"
              aria-label="Search"
              placeholder="Search properties, enquiries"
              className="h-9 w-full border border-line/40 bg-surface pl-9 pr-3 text-[13.5px] text-fg outline-none placeholder:text-muted focus:border-fg"
            />
          </div>

          <div ref={menuRef} className="ml-auto flex items-center gap-1.5 md:ml-0">
            <Link href="/" target="_blank" aria-label="View website" title="View website" className="admin-icon-btn">
              <AdminIcon name="globe" />
            </Link>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />

            <div className="relative">
              <button
                type="button"
                aria-label={`Notifications, ${unread} unread`}
                aria-expanded={menu === "bell"}
                onClick={() => setMenu(menu === "bell" ? null : "bell")}
                className="admin-icon-btn relative"
              >
                <AdminIcon name="bell" />
                <span className="absolute right-0 top-0 flex h-[15px] min-w-[15px] items-center justify-center bg-error px-[3px] text-[9.5px] font-medium leading-none text-bg">
                  {unread}
                </span>
              </button>
              {menu === "bell" && (
                <div className="admin-pop right-[-56px] w-[340px] max-w-[calc(100vw-24px)] sm:right-0">
                  <div className="flex items-center justify-between border-b border-line/30 px-4 py-3">
                    <p className="text-[14px]">Notifications</p>
                    <span className="text-[12px] text-muted">Mark all as read</span>
                  </div>
                  <ul>
                    {notifications.map((item) => (
                      <li key={item.title} className="flex gap-3 border-b border-line/20 px-4 py-3 last:border-b-0">
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.unread ? "bg-error" : "bg-line/50"}`} />
                        <div className="min-w-0">
                          <p className="text-[13.5px]">{item.title}</p>
                          <p className="truncate text-[12.5px] text-muted">{item.text}</p>
                          <p className="mt-0.5 text-[11.5px] text-muted">{item.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-line/30 px-4 py-2.5 text-center text-[12px] uppercase tracking-[0.14em] text-muted">
                    View all
                  </div>
                </div>
              )}
            </div>

            <div className="relative ml-1">
              <button
                type="button"
                aria-label="Account menu"
                aria-expanded={menu === "user"}
                onClick={() => setMenu(menu === "user" ? null : "user")}
                className="flex h-9 items-center gap-2 pl-1 pr-1.5 hover:bg-button/60"
              >
                <span className="flex h-8 w-8 items-center justify-center bg-button text-[13px]">{initial}</span>
                <span className="hidden text-muted md:block">
                  <AdminIcon name="chevron" size={14} />
                </span>
              </button>
              {menu === "user" && (
                <div className="admin-pop right-0 w-[240px]">
                  <div className="border-b border-line/30 px-4 py-3">
                    <p className="text-[14px]">Super Admin</p>
                    <p className="truncate text-[12.5px] text-muted">{email || "admin"}</p>
                  </div>
                  <button type="button" onClick={logout} className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] hover:bg-button/60">
                    <AdminIcon name="logout" size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1240px] px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </>
  );
}
