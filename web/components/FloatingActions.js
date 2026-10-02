"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";

export default function FloatingActions() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);
  const onDetail = pathname.startsWith("/projects/") && pathname !== "/projects/";

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const glass =
    "flex h-12 w-12 items-center justify-center border border-white/15 bg-[#1f1f21]/60 text-white backdrop-blur-xl transition hover:bg-[#1f1f21]/80";

  return (
    <div
      className={`fixed right-4 z-30 flex flex-col items-end gap-3 sm:right-6 ${
        onDetail ? "bottom-24 md:bottom-6" : "bottom-5 sm:bottom-6"
      }`}
    >
      <button
        type="button"
        aria-label="Back to top"
        title="Back to top"
        tabIndex={showTop ? 0 : -1}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`${glass} ${showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
      <a
        href={SITE.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat on WhatsApp"
        className="flex h-12 w-12 items-center justify-center bg-white text-[#1f1f21] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:scale-105"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.5 3.5A11.8 11.8 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.4-1.7a11.9 11.9 0 0 0 5.6 1.4c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.200-3.4-8.300zM12 21.700a9.900 9.900 0 0 1-5-1.400l-.4-.2-3.800 1 1-3.700-.2-.4a9.800 9.800 0 0 1-1.500-5.200C2.100 6.400 6.600 2 12 2c2.600 0 5.100 1 6.900 2.900a9.700 9.700 0 0 1 2.900 6.900c0 5.400-4.400 9.900-9.800 9.900zm5.400-7.400c-.3-.1-1.800-.9-2-1-.3-.1-.5-.1-.7.100-.2.300-.8 1-.9 1.200-.2.200-.3.200-.6.100-.3-.1-1.200-.4-2.400-1.400-.9-.8-1.400-1.700-1.600-2-.2-.3 0-.5.100-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.200c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.100-.8.400-.3.300-1 1-1 2.500s1.100 2.900 1.200 3.100c.1.200 2.100 3.200 5.100 4.500.7.300 1.300.5 1.700.6.700.2 1.400.2 1.900.1.600-.1 1.800-.7 2-1.400.3-.7.300-1.300.2-1.400-.1-.1-.3-.2-.6-.3z" />
        </svg>
      </a>
    </div>
  );
}
