"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { SITE } from "@/lib/site";

const links = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Enquire", href: "/#enquiry" },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname.startsWith(href);
  };

  const glass = scrolled || open;

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ${
        glass
          ? "border-white/10 bg-[#1f1f21]/55 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl backdrop-saturate-150"
          : "border-white/[0.06] bg-white/[0.04] backdrop-blur-md backdrop-saturate-125"
      }`}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Logo />

        <nav className="hidden items-center gap-10 md:flex" aria-label="Main">
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-2 text-[15px] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-white after:transition-transform after:duration-300 ${
                  active
                    ? "text-white after:scale-x-100"
                    : "text-white/80 after:scale-x-0 hover:text-white hover:after:scale-x-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/#enquiry" className="btn btn-white !h-10 !px-5 !tracking-[0.12em]">
            Enquire Now
          </Link>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span className="relative block h-[14px] w-5">
              <span className={`absolute left-0 h-px w-5 bg-white transition-all duration-300 ${open ? "top-[7px] rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-[7px] h-px w-5 bg-white transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute left-0 h-px w-5 bg-white transition-all duration-300 ${open ? "top-[7px] -rotate-45" : "top-[14px]"}`} />
            </span>
          </button>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 md:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <nav aria-label="Mobile" className="overflow-hidden">
          <div className="mx-auto max-w-[1400px] px-5 pb-6 pt-2 sm:px-8">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                tabIndex={open ? 0 : -1}
                className={`block border-b border-white/10 py-4 text-[20px] font-light ${isActive(link.href) ? "text-white" : "text-white/80"}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <a href={SITE.phoneLink} tabIndex={open ? 0 : -1} className="btn btn-gray">Call</a>
              <a href={SITE.whatsappLink} tabIndex={open ? 0 : -1} target="_blank" rel="noopener noreferrer" className="btn btn-gray">WhatsApp</a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
