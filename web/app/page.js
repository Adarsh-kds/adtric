import Image from "next/image";
import Link from "next/link";
import ArrowIcon from "@/components/ArrowIcon";
import EnquirySection from "@/components/EnquirySection";
import ProjectCard from "@/components/ProjectCard";
import { getLocations, getProjectOptions, getProjects } from "@/lib/api";
import { SITE } from "@/lib/site";

export default async function HomePage() {
  const [featured, locations, projectOptions] = await Promise.all([
    getProjects({ featured: "true", limit: "3" }),
    getLocations(),
    getProjectOptions(),
  ]);

  return (
    <>
      <section className="relative flex min-h-[620px] items-end overflow-hidden lg:min-h-[720px]">
        <Image
          src="/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />

        <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-20 pt-24 sm:px-8 lg:px-10 lg:pb-28">
          <span className="inline-block bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-[#282828]">
            Now showing · Featured projects
          </span>
          <h1 className="heading mt-7 text-[46px] sm:text-6xl lg:text-[84px]">
            Homes by {SITE.name}.
            <br />
            Across India.
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-white/90">
            Premium apartments, villas and commercial spaces, designed for the
            way you live next.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/projects" className="btn btn-white">
              View all projects
            </Link>
            <Link href="#enquiry" className="btn bg-black/35 text-white backdrop-blur hover:bg-black/55">
              Enquire now
            </Link>
          </div>
        </div>

        <p className="absolute bottom-6 right-5 hidden bg-black/40 px-6 py-4 text-[14px] backdrop-blur sm:right-8 md:block lg:right-10">
          {projectOptions.length} projects · {locations.length} cities
        </p>
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="heading text-[40px] sm:text-5xl lg:text-[56px]">Featured projects</h2>
          <div className="flex flex-col gap-4 md:items-end md:text-right">
            <p className="max-w-sm text-[14px] leading-relaxed text-muted">
              A selection of projects launching, building and ready to move into right now.
            </p>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] hover:text-muted"
            >
              View all projects
              <ArrowIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {featured.data.length > 0 ? (
          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {featured.data.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        ) : (
          <p className="mt-14 border border-white/10 p-10 text-center text-muted">
            Featured projects will appear here soon.
          </p>
        )}

        <div className="mt-16 flex justify-center">
          <Link href="/projects" className="btn btn-gray">
            View all projects
          </Link>
        </div>
      </section>

      <EnquirySection projects={projectOptions} />
    </>
  );
}
