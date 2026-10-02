"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminPager from "@/components/admin/AdminPager";
import AdminIcon from "@/components/admin/AdminIcon";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { adminFetch } from "@/lib/adminApi";
import { formatPrice } from "@/lib/format";

export default function AdminProjects() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const load = useCallback(async (pageNumber) => {
    const result = await adminFetch(`/projects?page=${pageNumber}`);
    if (result.ok) {
      setData(result.body);
      setError("");
    } else {
      setError(result.body.message || "Could not load properties");
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  const askDelete = (project) => {
    setDeleteError("");
    setTarget(project);
  };

  const closeDialog = () => {
    if (!deleting) setTarget(null);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    const result = await adminFetch(`/projects/${target._id}`, { method: "DELETE" });
    setDeleting(false);
    if (!result.ok) {
      setDeleteError(result.body.message || "Could not delete the property");
      return;
    }
    setTarget(null);
    if (data.data.length === 1 && page > 1) setPage(page - 1);
    else load(page);
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading text-[30px]">Properties</h1>
          <p className="mt-1 text-[14px] text-muted">{data ? `${data.total} ${data.total === 1 ? "property" : "properties"} in your portfolio` : "Manage the projects shown on the website"}</p>
        </div>
        <Link href="/admin/projects/new" className="btn btn-white">
          Add property
        </Link>
      </div>

      {error && <p role="alert" className="field-error mb-4">{error}</p>}
      {!data && !error && <p className="text-muted">Loading...</p>}

      {data && data.data.length === 0 && <p className="text-muted">No properties yet.</p>}

      {data && data.data.length > 0 && (
        <div className="admin-panel hidden px-5 md:block">
          <table className="w-full text-left text-[14px]">
            <thead className="eyebrow border-b border-line/50">
              <tr>
                <th className="py-3 pr-4 font-normal">Property</th>
                <th className="py-3 pr-4 font-normal">Location</th>
                <th className="py-3 pr-4 font-normal">Type</th>
                <th className="py-3 pr-4 font-normal">From</th>
                <th className="py-3 pr-4 font-normal">Flags</th>
                <th className="py-3 text-right font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((project) => (
                <tr key={project._id} className="border-b border-line/30">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={project.coverImage} alt="" className="h-12 w-16 object-cover" />
                      <span>{project.name}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">{project.location}</td>
                  <td className="py-4 pr-4">{project.propertyType}</td>
                  <td className="py-4 pr-4">{formatPrice(project.startingPrice)}</td>
                  <td className="py-4 pr-4 text-[12px] uppercase tracking-[0.1em]">
                    {project.featured && <span className="mr-2 bg-fg px-2 py-1 text-bg">Featured</span>}
                    {!project.published && <span className="bg-button px-2 py-1">Hidden</span>}
                  </td>
                  <td className="py-4 text-right">
                    <span className="inline-flex items-center gap-1">
                      <Link href={`/admin/projects/${project._id}/edit`} aria-label={`Edit ${project.name}`} title="Edit" className="admin-icon-btn">
                        <AdminIcon name="edit" />
                      </Link>
                      <button type="button" aria-label={`Delete ${project.name}`} title="Delete" className="admin-icon-btn hover:!text-error" onClick={() => askDelete(project)}>
                        <AdminIcon name="trash" />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.data.length > 0 && (
        <ul className="admin-panel px-4 md:hidden">
          {data.data.map((project) => (
            <li key={project._id} className="border-b border-line/30 py-5">
              <div className="flex gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.coverImage} alt="" className="h-16 w-20 shrink-0 object-cover" />
                <div className="min-w-0">
                  <p className="text-[16px]">{project.name}</p>
                  <p className="mt-1 text-[13px] text-muted">
                    {project.location} · {project.propertyType} · {formatPrice(project.startingPrice)}
                  </p>
                  <p className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.1em]">
                    {project.featured && <span className="bg-fg px-2 py-1 text-bg">Featured</span>}
                    {!project.published && <span className="bg-button px-2 py-1">Hidden</span>}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[14px]">
                <Link href={`/admin/projects/${project._id}/edit`} aria-label={`Edit ${project.name}`} title="Edit" className="admin-icon-btn !bg-button/60">
                  <AdminIcon name="edit" />
                </Link>
                <button type="button" aria-label={`Delete ${project.name}`} title="Delete" className="admin-icon-btn !bg-button/60 hover:!text-error" onClick={() => askDelete(project)}>
                  <AdminIcon name="trash" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete this property?"
        message={target ? `"${target.name}" and all of its images will be permanently removed. This cannot be undone.` : ""}
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
