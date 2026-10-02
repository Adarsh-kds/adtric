"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminIcon from "@/components/admin/AdminIcon";
import AdminPager from "@/components/admin/AdminPager";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { adminFetch } from "@/lib/adminApi";

const STATUSES = ["New", "Contacted", "Site Visit Done", "Closed"];

const formatDate = (value) =>
  new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AdminEnquiries() {
  const [page, setPage] = useState(1);
  const [projectId, setProjectId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ project: "", status: "", from: "", to: "" });
  const filterRef = useRef(null);
  const [toDate, setToDate] = useState("");
  const [projects, setProjects] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/options/list`)
      .then((response) => response.json())
      .then((body) => setProjects(body.data || []))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    const query = new URLSearchParams({ page: String(page) });
    if (projectId) query.set("project", projectId);
    if (statusFilter) query.set("status", statusFilter);
    // Day boundaries in the admin's own time zone.
    if (fromDate) query.set("from", new Date(`${fromDate}T00:00:00`).toISOString());
    if (toDate) query.set("to", new Date(`${toDate}T23:59:59.999`).toISOString());
    const result = await adminFetch(`/enquiries?${query}`);
    if (result.ok) {
      setData(result.body);
      setError("");
    } else {
      setError(result.body.message || "Could not load enquiries");
    }
  }, [page, projectId, statusFilter, fromDate, toDate]);

  useEffect(() => {
    load();
  }, [load]);

  const replaceRow = (updated) =>
    setData((old) => ({ ...old, data: old.data.map((row) => (row._id === updated._id ? updated : row)) }));

  const changeStatus = async (id, status) => {
    setBusyId(id);
    const result = await adminFetch(`/enquiries/${id}/status`, { method: "PATCH", json: { status } });
    setBusyId("");
    if (!result.ok) setError(result.body.message || "Could not update the status");
    else if (statusFilter) load();
    else replaceRow(result.body.data);
  };

  const retry = async (id) => {
    setBusyId(id);
    const result = await adminFetch(`/enquiries/${id}/retry-crm`, { method: "POST" });
    setBusyId("");
    if (result.ok) replaceRow(result.body.data);
    else setError(result.body.message || "Could not retry the CRM push");
  };

  const askDelete = (row) => {
    setDeleteError("");
    setTarget(row);
  };

  const closeDialog = () => {
    if (!deleting) setTarget(null);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    const result = await adminFetch(`/enquiries/${target._id}`, { method: "DELETE" });
    setDeleting(false);
    if (!result.ok) {
      setDeleteError(result.body.message || "Could not delete the enquiry");
      return;
    }
    setTarget(null);
    if (data.data.length === 1 && page > 1) setPage(page - 1);
    else load();
  };

  const filtersActive = Boolean(projectId || statusFilter || fromDate || toDate);
  const activeCount = [projectId, statusFilter, fromDate, toDate].filter(Boolean).length;

  const clearFilters = () => {
    setProjectId("");
    setStatusFilter("");
    setFromDate("");
    setToDate("");
    setDraft({ project: "", status: "", from: "", to: "" });
    setPage(1);
  };

  const toggleFilters = () => {
    if (!open) setDraft({ project: projectId, status: statusFilter, from: fromDate, to: toDate });
    setOpen(!open);
  };

  const applyFilters = () => {
    setProjectId(draft.project);
    setStatusFilter(draft.status);
    setFromDate(draft.from);
    setToDate(draft.to);
    setPage(1);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "mousedown" && filterRef.current && filterRef.current.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const projectName = (id) => (projects.find((item) => item._id === id) || {}).name || "Property";
  const chips = [
    projectId && { label: projectName(projectId), clear: () => setProjectId("") },
    statusFilter && { label: statusFilter, clear: () => setStatusFilter("") },
    fromDate && { label: `From ${fromDate}`, clear: () => setFromDate("") },
    toDate && { label: `To ${toDate}`, clear: () => setToDate("") },
  ].filter(Boolean);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="heading text-[30px]">Enquiries</h1>
          <p className="mt-1 text-[14px] text-muted">{data ? `${data.total} ${data.total === 1 ? "enquiry" : "enquiries"} received` : "Leads from the website enquiry form"}</p>
        </div>
        <div ref={filterRef} className="relative">
          <button
            type="button"
            onClick={toggleFilters}
            aria-expanded={open}
            aria-haspopup="dialog"
            className="btn btn-gray gap-2.5 !px-5"
          >
            <AdminIcon name="filter" size={16} />
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center bg-fg px-1 text-[11px] leading-none text-bg">
                {activeCount}
              </span>
            )}
          </button>

          {open && (
            <div role="dialog" aria-label="Filter enquiries" className="admin-pop right-0 w-[min(360px,calc(100vw-32px))] p-5">
              <div className="grid gap-5">
                <div>
                  <label htmlFor="project-filter" className="field-label">Property</label>
                  <select id="project-filter" className="field-input" value={draft.project} onChange={(event) => setDraft({ ...draft, project: event.target.value })}>
                    <option value="">All properties</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="status-filter" className="field-label">Status</label>
                  <select id="status-filter" className="field-input" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
                    <option value="">All statuses</option>
                    {STATUSES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <label htmlFor="from-date" className="field-label">From</label>
                    <input id="from-date" type="date" className="field-input" value={draft.from} max={draft.to || undefined} onChange={(event) => setDraft({ ...draft, from: event.target.value })} />
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="to-date" className="field-label">To</label>
                    <input id="to-date" type="date" className="field-input" value={draft.to} min={draft.from || undefined} onChange={(event) => setDraft({ ...draft, to: event.target.value })} />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <button type="button" onClick={() => { clearFilters(); setOpen(false); }} className="text-[13px] text-muted underline hover:text-fg">
                  Clear all
                </button>
                <button type="button" onClick={applyFilters} className="btn btn-white">
                  Apply filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="-mt-2 mb-5 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <span key={chip.label} className="inline-flex items-center gap-2 bg-chip px-3 py-1.5 text-[13px]" style={{ background: "var(--color-button)" }}>
              {chip.label}
              <button type="button" aria-label={`Remove filter ${chip.label}`} onClick={() => { chip.clear(); setPage(1); }} className="text-muted hover:text-fg">
                <AdminIcon name="close" size={13} />
              </button>
            </span>
          ))}
          <button type="button" onClick={clearFilters} className="ml-1 text-[13px] text-muted underline hover:text-fg">
            Clear all
          </button>
        </div>
      )}

      {error && <p role="alert" className="field-error mb-4">{error}</p>}
      {!data && !error && <p className="text-muted">Loading...</p>}
      {data && data.data.length === 0 && (
        <p className="text-muted">{filtersActive ? "No enquiries match these filters." : "No enquiries yet."}</p>
      )}

      {data && data.data.length > 0 && (
        <div className="admin-panel hidden px-5 md:block">
          <table className="w-full text-left text-[14px]">
            <thead className="eyebrow border-b border-line/50">
              <tr>
                <th className="py-3 pr-4 font-normal">Received</th>
                <th className="py-3 pr-4 font-normal">Name</th>
                <th className="py-3 pr-4 font-normal">Contact</th>
                <th className="py-3 pr-4 font-normal">Property</th>
                <th className="py-3 pr-4 font-normal">Message</th>
                <th className="py-3 pr-4 font-normal">Status</th>
                <th className="py-3 pr-4 font-normal">CRM</th>
                <th className="py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((row) => (
                <tr key={row._id} className="border-b border-line/30 align-middle">
                  <td className="py-4 pr-4 whitespace-nowrap text-muted">{formatDate(row.createdAt)}</td>
                  <td className="py-4 pr-4">{row.name}</td>
                  <td className="py-4 pr-4">
                    <div>{row.mobile}</div>
                    {row.email && <div className="text-muted">{row.email}</div>}
                  </td>
                  <td className="py-4 pr-4">{row.project ? row.project.name : "Deleted property"}</td>
                  <td className="max-w-[220px] py-4 pr-4 text-muted">{row.message || "-"}</td>
                  <td className="py-4 pr-4">
                    <select
                      value={row.status}
                      disabled={busyId === row._id}
                      onChange={(event) => changeStatus(row._id, event.target.value)}
                      className="field-input !py-1"
                      aria-label="Enquiry status"
                    >
                      {STATUSES.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 pr-4 align-middle">
                    {row.crmStatus === "Sent" ? (
                      <span className="bg-ok/20 px-2 py-1 text-[12px] uppercase tracking-[0.1em] text-ok">Sent</span>
                    ) : (
                      <span className="inline-flex items-center gap-3">
                        <span className="bg-error/20 px-2 py-1 text-[12px] uppercase tracking-[0.1em] text-error">Failed</span>
                        <button disabled={busyId === row._id} onClick={() => retry(row._id)} className="underline disabled:opacity-50">
                          Retry
                        </button>
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <button type="button" aria-label={`Delete enquiry from ${row.name}`} title="Delete" className="admin-icon-btn hover:!text-error" onClick={() => askDelete(row)}>
                      <AdminIcon name="trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.data.length > 0 && (
        <ul className="admin-panel px-4 md:hidden">
          {data.data.map((row) => (
            <li key={row._id} className="border-b border-line/30 py-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[16px]">{row.name}</p>
                <div className="flex items-center gap-1">
                  <p className="text-right text-[12px] text-muted">{formatDate(row.createdAt)}</p>
                  <button type="button" aria-label={`Delete enquiry from ${row.name}`} title="Delete" className="admin-icon-btn !bg-button/60 hover:!text-error" onClick={() => askDelete(row)}>
                    <AdminIcon name="trash" />
                  </button>
                </div>
              </div>
              <p className="mt-1 text-[14px]">{row.mobile}</p>
              {row.email && <p className="text-[14px] text-muted">{row.email}</p>}
              <p className="mt-3 text-[13px] text-muted">
                For: <span className="text-fg">{row.project ? row.project.name : "Deleted property"}</span>
              </p>
              {row.message && <p className="mt-2 text-[14px] text-muted">{row.message}</p>}
              <div className="mt-4 grid grid-cols-2 items-end gap-4">
                <div>
                  <label className="eyebrow">Status</label>
                  <select
                    value={row.status}
                    disabled={busyId === row._id}
                    onChange={(event) => changeStatus(row._id, event.target.value)}
                    className="field-input !py-1"
                    aria-label="Enquiry status"
                  >
                    {STATUSES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  {row.crmStatus === "Sent" ? (
                    <span className="bg-ok/20 px-2 py-1 text-[12px] uppercase tracking-[0.1em] text-ok">CRM sent</span>
                  ) : (
                    <>
                      <span className="bg-error/20 px-2 py-1 text-[12px] uppercase tracking-[0.1em] text-error">CRM failed</span>
                      <button disabled={busyId === row._id} onClick={() => retry(row._id)} className="underline disabled:opacity-50">
                        Retry
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete this enquiry?"
        message={target ? `The enquiry from ${target.name} (${target.mobile}) will be permanently removed. This cannot be undone.` : ""}
        confirmLabel="Delete"
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={closeDialog}
      />

      {data && <AdminPager page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </>
  );
}
