import ProjectForm from "@/components/admin/ProjectForm";

export default function NewProject() {
  return (
    <>
      <h1 className="heading text-[30px]">Add property</h1>
      <p className="mb-6 mt-1 text-[14px] text-muted">Fill in the details and add images. The property appears on the website once it is published.</p>
      <div className="admin-panel p-5 md:p-8">
        <ProjectForm />
      </div>
    </>
  );
}
