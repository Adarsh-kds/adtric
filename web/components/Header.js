import Link from "next/link";
import Logo from "@/components/Logo";

const links = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Enquire", href: "/#enquiry" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] w-full max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Logo />

        <nav className="hidden items-center gap-9 md:flex" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[15px] text-white/90 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/#enquiry" className="btn btn-white !h-10 !px-5 !tracking-[0.12em]">
            Enquire Now
          </Link>

          <details className="group relative md:hidden">
            <summary
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center [&::-webkit-details-marker]:hidden"
              aria-label="Open menu"
            >
              <span className="space-y-[5px]">
                <span className="block h-px w-5 bg-white" />
                <span className="block h-px w-5 bg-white" />
                <span className="block h-px w-5 bg-white" />
              </span>
            </summary>
            <nav
              className="absolute right-0 top-12 w-56 border border-white/10 bg-surface py-2 shadow-2xl"
              aria-label="Mobile"
            >
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block px-5 py-3 text-[15px] text-white/90 hover:bg-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
