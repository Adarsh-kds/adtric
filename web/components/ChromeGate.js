"use client";

import { usePathname } from "next/navigation";

// Hides the public header/footer on admin pages.
export default function ChromeGate({ children }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return children;
}
