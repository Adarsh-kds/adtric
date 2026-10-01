import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Logo() {
  return (
    <Link href="/" className="inline-block leading-none" aria-label={SITE.title}>
      <span className="heading block text-[26px] font-normal tracking-[0.14em]">
        {SITE.name}
      </span>
      <span className="mt-1 block pl-[2px] text-[9px] tracking-[0.5em] text-muted">
        {SITE.suffix}
      </span>
    </Link>
  );
}
