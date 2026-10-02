"use client";

import AdminIcon from "@/components/admin/AdminIcon";

export default function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === "light";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
      className="admin-icon-btn"
    >
      <AdminIcon name={isLight ? "moon" : "sun"} />
    </button>
  );
}
