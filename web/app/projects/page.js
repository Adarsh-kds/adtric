import Link from "next/link";
import EnquirySection from "@/components/EnquirySection";
import Pagination from "@/components/Pagination";
import Reveal from "@/components/Reveal";
import ProjectCard from "@/components/ProjectCard";
import ProjectFilters from "@/components/ProjectFilters";
import { getLocations, getProjectOptions, getProjects } from "@/lib/api";

export const metadata = {
  title: "Projects",
  description:
    "Browse all our apartments, villas and commercial projects. Filter by location, property type and budget.",
};

const asText = (value) => (typeof value === "string" ? value : "");

export default async function ProjectsPage({ searchParams }) {
  const params = await searchParams;

  const page = Math.max(parseInt(asText(params.page)) || 1, 1);
  const filters = {
    location: asText(params.location),
    propertyType: asText(params.propertyType),
    minPrice: asText(params.minPrice),
    maxPrice: asText(params.maxPrice),
    sort: asText(params.sort),
    page: String(page),
    limit: "6",
  };

  const [result, locations, projectOptions] = await Promise.all([
    getProjects(filters),
    getLocations(),
    getProjectOptions(),
  ]);

  return (
    <>
      <section className="mx-auto w-full max-w-[1400px] px-5 pb-20 pt-16 sm:px-8 lg:px-10 lg:pb-28 lg:pt-24">
        <p className="eyebrow rise">Projects</p>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h1 className="heading rise text-[44px] sm:text-6xl lg:text-[72px]">All projects</h1>
          <p className="text-[14px] text-muted">
            {result.total} {result.total === 1 ? "project" : "projects"} found
          </p>
        </div>

        <div className="mt-12">
          <ProjectFilters locations={locations} />
        </div>

        {result.data.length > 0 ? (
          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.map((project, index) => (
              <Reveal key={project._id} delay={(index % 3) * 100}>
                <ProjectCard project={project} priority={index < 3} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-14 border border-white/10 px-6 py-20 text-center">
            <h2 className="heading text-3xl">No projects found</h2>
            <p className="mt-3 text-muted">
              Try changing or clearing your filters to see more projects.
            </p>
            <Link href="/projects" className="btn btn-white mt-8">
              Clear filters
            </Link>
          </div>
        )}

        <Pagination page={result.page} totalPages={result.totalPages} searchParams={params} />
      </section>

      <EnquirySection projects={projectOptions} />
    </>
  );
}
