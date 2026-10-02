"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminIcon from "@/components/admin/AdminIcon";

const sections = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", icon: "dashboard" }],
  },
  {
    label: "Manage",
    items: [
      { label: "Properties", icon: "building", href: "/admin/projects" },
      { label: "Enquiries", icon: "inbox", href: "/admin/enquiries" },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Leads pipeline", icon: "funnel" },
      { label: "Site visits", icon: "calendar" },
      { label: "Customers", icon: "users" },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", icon: "chart" },
      { label: "Reports", icon: "file" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Team", icon: "team" },
      { label: "Settings", icon: "settings" },
      { label: "Help and support", icon: "help" },
    ],
  },
];

export default function AdminSidebar({ onNavigate }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="flex flex-col gap-6 px-3 py-5">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="eyebrow mb-2 px-3 !text-[10.5px]">{section.label}</p>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = item.href && pathname.startsWith(item.href);
              const base = "flex h-9 items-center gap-3 px-3 text-[14px]";
              if (!item.href) {
                return (
                  <li key={item.label}>
                    <span aria-disabled="true" title="Coming soon" className={`${base} cursor-not-allowed text-muted opacity-55`}>
                      <AdminIcon name={item.icon} />
                      <span className="flex-1">{item.label}</span>
                      <span className="text-[9.5px] uppercase tracking-[0.14em]">Soon</span>
                    </span>
                  </li>
                );
              }
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`${base} transition-colors ${
                      active ? "bg-button text-fg shadow-[inset_2px_0_0_var(--color-fg)]" : "text-muted hover:bg-button/60 hover:text-fg"
                    }`}
                  >
                    <AdminIcon name={item.icon} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
