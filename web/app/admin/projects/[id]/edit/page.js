"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { adminFetch } from "@/lib/adminApi";

export default function EditProject() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch(`/projects/${id}`).then((result) => {
      if (result.ok) setProject(result.body.data);
      else setError(result.body.message || "Could not load the property");
    });
  }, [id]);

  if (error) return <p className="field-error">{error}</p>;
  if (!project) return <p className="text-muted">Loading...</p>;

  return (
    <>
      <h1 className="heading text-[30px]">Edit property</h1>
      <p className="mb-6 mt-1 text-[14px] text-muted">{project.name}</p>
      <div className="admin-panel p-5 md:p-8">
        <ProjectForm project={project} />
      </div>
    </>
  );
}
