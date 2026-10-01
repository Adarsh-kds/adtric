import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-[1400px] flex-col items-start justify-center px-5 sm:px-8 lg:px-10">
      <p className="eyebrow">Error 404</p>
      <h1 className="heading mt-4 text-5xl lg:text-7xl">Page not found.</h1>
      <p className="mt-4 max-w-md text-muted">
        The page you are looking for does not exist or is no longer available.
      </p>
      <Link href="/projects" className="btn btn-white mt-8">
        Browse projects
      </Link>
    </section>
  );
}
