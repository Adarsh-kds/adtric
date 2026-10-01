import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import EnquirySection from "@/components/EnquirySection";
import Gallery from "@/components/Gallery";
import { getProjectBySlug, getProjectOptions } from "@/lib/api";
import { formatPrice } from "@/lib/format";

const loadProject = cache(getProjectBySlug);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await loadProject(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: `${project.name} in ${project.location}`,
    description: project.shortDescription,
    openGraph: {
      title: `${project.name} in ${project.location}`,
      description: project.shortDescription,
      images: [project.coverImage],
    },
  };
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const [project, projectOptions] = await Promise.all([
    loadProject(slug),
    getProjectOptions(),
  ]);

  if (!project) {
    notFound();
  }

  const details = [
    { label: "Location", value: project.location },
    { label: "Property type", value: project.propertyType },
    { label: "Status", value: project.status },
    { label: "Configuration", value: project.configuration },
    { label: "Starting price", value: `${formatPrice(project.startingPrice)}*` },
  ];

  return (
    <>
      <article className="mx-auto w-full max-w-[1400px] px-5 pb-20 pt-10 sm:px-8 lg:px-10 lg:pb-28 lg:pt-14">
        <nav aria-label="Breadcrumb" className="eyebrow flex flex-wrap gap-2">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-white">
            Projects
          </Link>
          <span>/</span>
          <span className="text-white">{project.name}</span>
        </nav>

        <div className="relative mt-8 aspect-[4/3] overflow-hidden bg-surface sm:aspect-[16/9] lg:aspect-[21/9]">
          <Image
            src={project.coverImage}
            alt={project.name}
            fill
            priority
            sizes="(min-width: 1400px) 1320px, 100vw"
            className="object-cover"
          />
          <span className="absolute left-5 top-5 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#282828]">
            {project.status}
          </span>
        </div>

        <div className="mt-14 grid gap-14 lg:grid-cols-[2fr_1fr] lg:gap-20">
          <div>
            <p className="eyebrow">
              {project.location} · {project.propertyType}
            </p>
            <h1 className="heading mt-4 text-[44px] sm:text-6xl lg:text-[72px]">
              {project.name}
            </h1>
            <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-white/90">
              {project.shortDescription}
            </p>

            <dl className="mt-12 border-t border-line/60">
              {details.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[140px_1fr] gap-4 border-b border-line/60 py-5 sm:grid-cols-[200px_1fr]"
                >
                  <dt className="eyebrow">{item.label}</dt>
                  <dd className="text-[16px]">{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[13px] text-muted">
              * Starting price is indicative and subject to change.
            </p>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="bg-surface p-8">
              <p className="eyebrow">Starting from</p>
              <p className="heading mt-3 text-5xl">{formatPrice(project.startingPrice)}*</p>
              <p className="mt-3 text-[14px] text-muted">{project.configuration}</p>
              <div className="mt-8 grid gap-3">
                <Link href="#enquiry" className="btn btn-white">
                  Enquire now
                </Link>
                <Link href="/projects" className="btn btn-gray">
                  All projects
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {project.gallery.length > 0 && (
          <section className="mt-20">
            <h2 className="heading text-4xl lg:text-5xl">Gallery</h2>
            <div className="mt-8">
              <Gallery images={project.gallery} name={project.name} />
            </div>
          </section>
        )}
      </article>

      <EnquirySection
        projects={projectOptions}
        defaultProjectId={project._id}
        title={`Enquire about ${project.name}`}
        intro="Share your details and our sales team will get in touch with pricing, availability and site visit options."
      />
    </>
  );
}
