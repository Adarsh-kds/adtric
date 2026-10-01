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
      else setError(result.body.message || "Could not load the project");
    });
  }, [id]);

  if (error) return <p className="field-error">{error}</p>;
  if (!project) return <p className="text-muted">Loading...</p>;

  return (
    <>
      <h1 className="heading mb-10 text-[36px]">Edit project</h1>
      <ProjectForm project={project} />
    </>
  );
}
