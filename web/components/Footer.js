import Link from "next/link";
import Logo from "@/components/Logo";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-bg">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr_1fr]">
          <Logo />

          <p className="max-w-xl text-[14px] leading-relaxed text-muted">
            Project details, prices and availability are indicative and may
            change without notice. Please verify the RERA registration of a
            project before booking.
          </p>

          <nav aria-label="Footer" className="space-y-3 text-[14px]">
            <Link href="/" className="block text-white/90 hover:text-white">
              Home
            </Link>
            <Link href="/projects" className="block text-white/90 hover:text-white">
              Projects
            </Link>
            <Link href="/#enquiry" className="block text-white/90 hover:text-white">
              Enquire
            </Link>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] text-muted sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE.title}. All rights reserved.</span>
          <a href={SITE.phoneLink} className="hover:text-white">
            {SITE.phone}
          </a>
        </div>
      </div>
    </footer>
  );
}
