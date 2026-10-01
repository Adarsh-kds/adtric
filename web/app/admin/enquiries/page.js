"use client";

import { useCallback, useEffect, useState } from "react";
import AdminPager from "@/components/admin/AdminPager";
import { adminFetch } from "@/lib/adminApi";

const STATUSES = ["New", "Contacted", "Site Visit Done", "Closed"];

const formatDate = (value) =>
  new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AdminEnquiries() {
  const [page, setPage] = useState(1);
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/options/list`)
      .then((response) => response.json())
      .then((body) => setProjects(body.data || []))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    const query = new URLSearchParams({ page: String(page) });
    if (projectId) query.set("project", projectId);
    const result = await adminFetch(`/enquiries?${query}`);
    if (result.ok) {
      setData(result.body);
      setError("");
    } else {
      setError(result.body.message || "Could not load enquiries");
    }
  }, [page, projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const replaceRow = (updated) =>
    setData((old) => ({ ...old, data: old.data.map((row) => (row._id === updated._id ? updated : row)) }));

  const changeStatus = async (id, status) => {
    setBusyId(id);
    const result = await adminFetch(`/enquiries/${id}/status`, { method: "PATCH", json: { status } });
    setBusyId("");
    if (result.ok) replaceRow(result.body.data);
    else setError(result.body.message || "Could not update the status");
  };

  const retry = async (id) => {
    setBusyId(id);
    const result = await adminFetch(`/enquiries/${id}/retry-crm`, { method: "POST" });
    setBusyId("");
    if (result.ok) replaceRow(result.body.data);
    else setError(result.body.message || "Could not retry the CRM push");
  };

  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="heading text-[36px]">Enquiries</h1>
          {data && <p className="mt-1 text-muted">{data.total} in total</p>}
        </div>
        <div className="w-full md:max-w-[280px]">
          <label htmlFor="project-filter" className="field-label">Project</label>
          <select
            id="project-filter"
            className="field-input"
            value={projectId}
            onChange={(event) => {
              setPage(1);
              setProjectId(event.target.value);
            }}
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>{project.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p role="alert" className="field-error mb-4">{error}</p>}
      {!data && !error && <p className="text-muted">Loading...</p>}
      {data && data.data.length === 0 && <p className="text-muted">No enquiries found.</p>}

      {data && data.data.length > 0 && (
        <div className="hidden md:block">
          <table className="w-full text-left text-[14px]">
            <thead className="eyebrow border-b border-line/50">
              <tr>
                <th className="py-3 pr-4 font-normal">Received</th>
                <th className="py-3 pr-4 font-normal">Name</th>
                <th className="py-3 pr-4 font-normal">Contact</th>
                <th className="py-3 pr-4 font-normal">Project</th>
                <th className="py-3 pr-4 font-normal">Message</th>
                <th className="py-3 pr-4 font-normal">Status</th>
                <th className="py-3 font-normal">CRM</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((row) => (
                <tr key={row._id} className="border-b border-line/30 align-top">
                  <td className="py-4 pr-4 whitespace-nowrap text-muted">{formatDate(row.createdAt)}</td>
                  <td className="py-4 pr-4">{row.name}</td>
                  <td className="py-4 pr-4">
                    <div>{row.mobile}</div>
                    {row.email && <div className="text-muted">{row.email}</div>}
                  </td>
                  <td className="py-4 pr-4">{row.project ? row.project.name : "Deleted project"}</td>
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
                  <td className="py-4">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.data.length > 0 && (
        <ul className="md:hidden">
          {data.data.map((row) => (
            <li key={row._id} className="border-b border-line/30 py-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[16px]">{row.name}</p>
                <p className="text-right text-[12px] text-muted">{formatDate(row.createdAt)}</p>
              </div>
              <p className="mt-1 text-[14px]">{row.mobile}</p>
              {row.email && <p className="text-[14px] text-muted">{row.email}</p>}
              <p className="mt-3 text-[13px] text-muted">
                For: <span className="text-fg">{row.project ? row.project.name : "Deleted project"}</span>
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

      {data && <AdminPager page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </>
  );
}
