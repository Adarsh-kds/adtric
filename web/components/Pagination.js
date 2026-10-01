import Link from "next/link";

const getPageNumbers = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  if (page > 3) pages.push("...");
  for (let number = Math.max(2, page - 1); number <= Math.min(totalPages - 1, page + 1); number++) {
    pages.push(number);
  }
  if (page < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
};

export default function Pagination({ page, totalPages, searchParams }) {
  if (totalPages <= 1) {
    return null;
  }

  const buildHref = (number) => {
    const query = new URLSearchParams();
    Object.keys(searchParams).forEach((key) => {
      if (key !== "page" && typeof searchParams[key] === "string" && searchParams[key]) {
        query.set(key, searchParams[key]);
      }
    });
    if (number > 1) {
      query.set("page", String(number));
    }
    const text = query.toString();
    return text ? `/projects?${text}` : "/projects";
  };

  const base = "flex h-11 min-w-11 items-center justify-center px-4 text-[13px] tracking-[0.1em] transition-colors";

  return (
    <nav aria-label="Pagination" className="mt-16 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className={`${base} bg-button hover:bg-button-hover`}>
          Prev
        </Link>
      ) : (
        <span className={`${base} cursor-not-allowed bg-button/40 text-white/40`}>Prev</span>
      )}

      {getPageNumbers(page, totalPages).map((number, index) =>
        number === "..." ? (
          <span key={`gap-${index}`} className="px-2 text-muted">
            ...
          </span>
        ) : (
          <Link
            key={number}
            href={buildHref(number)}
            aria-current={number === page ? "page" : undefined}
            className={`${base} ${
              number === page ? "bg-white text-bg" : "bg-button hover:bg-button-hover"
            }`}
          >
            {number}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className={`${base} bg-button hover:bg-button-hover`}>
          Next
        </Link>
      ) : (
        <span className={`${base} cursor-not-allowed bg-button/40 text-white/40`}>Next</span>
      )}
    </nav>
  );
}
