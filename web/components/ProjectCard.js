import Image from "next/image";
import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import { formatPrice } from "@/lib/format";

export default function ProjectCard({ project }) {
  const detailUrl = `/projects/${project.slug}`;

  return (
    <article className="group flex flex-col">
      <Link href={detailUrl} className="relative block aspect-square overflow-hidden bg-surface">
        <Image
          src={project.coverImage}
          alt={project.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#282828]">
          {project.status}
        </span>
      </Link>

      <div className="mt-6 flex flex-1 flex-col">
        <p className="text-[12px] uppercase tracking-[0.18em] text-white/80">
          {project.location} · {project.propertyType}
        </p>

        <h3 className="mt-3 text-[26px] font-light leading-tight">
          <Link href={detailUrl} className="transition-colors hover:text-muted">
            {project.name}
          </Link>
        </h3>

        <div className="mt-4 flex items-end justify-between gap-4 border-t border-line/70 pt-4">
          <div className="min-w-0">
            <p className="truncate text-[12px] uppercase tracking-[0.12em] text-muted">
              {project.configuration}
            </p>
            <p className="mt-1.5 text-[15px]">
              From {formatPrice(project.startingPrice)}*
            </p>
          </div>
          <ArrowIcon className="mb-1 h-4 w-4 shrink-0 text-white/80 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href={detailUrl} className="btn btn-gray">
            Explore
          </Link>
          <Link href={`${detailUrl}#enquiry`} className="btn btn-white">
            Enquire
          </Link>
        </div>
      </div>
    </article>
  );
}
