export default function AdminPager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-4 text-[13px] uppercase tracking-[0.15em]">
      <button className="btn btn-gray !h-10" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Prev
      </button>
      <span className="text-muted">
        Page {page} of {totalPages}
      </span>
      <button className="btn btn-gray !h-10" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </div>
  );
}
