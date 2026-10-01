"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/adminApi";
import { formatPrice } from "@/lib/format";

const TYPES = ["Apartment", "Villa", "Commercial"];
const STATUSES = ["Upcoming", "Under Construction", "Ready"];
const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const empty = {
  name: "",
  location: "",
  propertyType: "Apartment",
  status: "Under Construction",
  startingPrice: "",
  configuration: "",
  shortDescription: "",
  featured: false,
  published: true,
};

const checkFiles = (files, label) => {
  for (const file of files) {
    if (!ALLOWED.includes(file.type)) return `${label}: only JPG, PNG or WebP images are allowed`;
    if (file.size > MAX_SIZE) return `${label}: each image must be 2MB or smaller`;
  }
  return "";
};

function Field({ label, error, children }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export default function ProjectForm({ project }) {
  const router = useRouter();
  const isEdit = Boolean(project);
  const [values, setValues] = useState(
    project
      ? {
          name: project.name,
          location: project.location,
          propertyType: project.propertyType,
          status: project.status,
          startingPrice: String(project.startingPrice),
          configuration: project.configuration,
          shortDescription: project.shortDescription,
          featured: project.featured,
          published: project.published,
        }
      : empty
  );
  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [newGallery, setNewGallery] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [gallery, setGallery] = useState(project ? project.gallery : []);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cover) return setCoverPreview("");
    const url = URL.createObjectURL(cover);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [cover]);

  useEffect(() => {
    const urls = newGallery.map((file) => URL.createObjectURL(file));
    setGalleryPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [newGallery]);

  const change = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((old) => ({ ...old, [name]: type === "checkbox" ? checked : value }));
    setErrors((old) => ({ ...old, [name]: undefined }));
  };

  const pickCover = (event) => {
    const file = event.target.files[0];
    if (!file) return setCover(null);
    const problem = checkFiles([file], "Cover image");
    if (problem) {
      setErrors((old) => ({ ...old, coverImage: problem }));
      event.target.value = "";
      return;
    }
    setErrors((old) => ({ ...old, coverImage: undefined }));
    setCover(file);
  };

  const pickGallery = (event) => {
    const files = Array.from(event.target.files);
    const problem = checkFiles(files, "Gallery");
    if (problem) {
      setErrors((old) => ({ ...old, gallery: problem }));
      event.target.value = "";
      return;
    }
    if (files.length + gallery.length > 6) {
      setErrors((old) => ({ ...old, gallery: "A project can have at most 6 gallery images" }));
      event.target.value = "";
      return;
    }
    setErrors((old) => ({ ...old, gallery: undefined }));
    setNewGallery(files);
  };

  const removeSaved = async (image) => {
    const result = await adminFetch(`/projects/${project._id}/gallery`, {
      method: "DELETE",
      json: { image },
    });
    if (result.ok) {
      setGallery(result.body.data.gallery);
    } else {
      setNotice(result.body.message || "Could not remove the image");
    }
  };

  const validate = () => {
    const found = {};
    if (values.name.trim().length < 2) found.name = "Name must be at least 2 characters";
    if (!values.location.trim()) found.location = "Location is required";
    if (values.startingPrice === "" || Number(values.startingPrice) < 0 || Number.isNaN(Number(values.startingPrice))) {
      found.startingPrice = "Enter the starting price as a number";
    }
    if (!values.configuration.trim()) found.configuration = "Configuration is required";
    if (!values.shortDescription.trim()) found.shortDescription = "Short description is required";
    if (values.shortDescription.length > 300) found.shortDescription = "Keep it under 300 characters";
    if (!isEdit && !cover) found.coverImage = "Cover image is required";
    return found;
  };

  const submit = async (event) => {
    event.preventDefault();
    setNotice("");
    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors((old) => ({ ...old, ...found }));
      return;
    }

    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => data.append(key, String(value)));
    if (cover) data.append("coverImage", cover);
    newGallery.forEach((file) => data.append("gallery", file));

    setLoading(true);
    const result = await adminFetch(isEdit ? `/projects/${project._id}` : "/projects", {
      method: isEdit ? "PUT" : "POST",
      body: data,
    });
    setLoading(false);

    if (!result.ok) {
      setErrors(result.body.errors || {});
      setNotice(result.body.message || "Could not save the project");
      return;
    }
    router.push("/admin/projects");
  };

  const textInput = (name, label, props = {}) => (
    <Field label={label} error={errors[name]}>
      <input
        name={name}
        value={values[name]}
        onChange={change}
        aria-invalid={Boolean(errors[name])}
        className="field-input"
        {...props}
      />
    </Field>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 md:grid-cols-2">
      {textInput("name", "Project name")}
      {textInput("location", "Location (city)")}
      <Field label="Property type" error={errors.propertyType}>
        <select name="propertyType" value={values.propertyType} onChange={change} className="field-input">
          {TYPES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
      <Field label="Status" error={errors.status}>
        <select name="status" value={values.status} onChange={change} className="field-input">
          {STATUSES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
      <div>
        {textInput("startingPrice", "Starting price (in rupees)", { inputMode: "numeric", placeholder: "e.g. 38500000" })}
        {values.startingPrice !== "" && Number(values.startingPrice) >= 0 && !errors.startingPrice && (
          <p className="mt-2 text-[13px] text-muted">Will show on the site as {formatPrice(Number(values.startingPrice))}</p>
        )}
      </div>
      {textInput("configuration", "Configuration", { placeholder: "e.g. 3 and 4 BHK" })}

      <div className="md:col-span-2">
        <Field label={`Short description (${values.shortDescription.length}/300)`} error={errors.shortDescription}>
          <textarea
            name="shortDescription"
            rows={3}
            value={values.shortDescription}
            onChange={change}
            aria-invalid={Boolean(errors.shortDescription)}
            className="field-input resize-none"
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-8 md:col-span-2">
        <label className="flex items-center gap-3 text-[14px]">
          <input type="checkbox" name="featured" checked={values.featured} onChange={change} className="h-4 w-4 accent-fg" />
          Featured on homepage
        </label>
        <label className="flex items-center gap-3 text-[14px]">
          <input type="checkbox" name="published" checked={values.published} onChange={change} className="h-4 w-4 accent-fg" />
          Published (visible on the website)
        </label>
      </div>

      <div>
        <Field label={isEdit ? "Replace cover image (optional)" : "Cover image"} error={errors.coverImage}>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickCover} className="mt-3 block w-full text-[13px] text-muted file:mr-4 file:cursor-pointer file:border-0 file:bg-button file:px-4 file:py-2 file:text-fg" />
        </Field>
        {(coverPreview || (isEdit && project.coverImage)) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPreview || project.coverImage} alt="Cover preview" className="mt-4 aspect-[4/3] w-full max-w-[320px] object-cover" />
        )}
      </div>

      <div>
        <Field label="Add gallery images (max 6 in total)" error={errors.gallery}>
          <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={pickGallery} className="mt-3 block w-full text-[13px] text-muted file:mr-4 file:cursor-pointer file:border-0 file:bg-button file:px-4 file:py-2 file:text-fg" />
        </Field>
        <div className="mt-4 flex flex-wrap gap-3">
          {gallery.map((image) => (
            <div key={image} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Gallery" className="h-20 w-28 object-cover" />
              <button
                type="button"
                onClick={() => removeSaved(image)}
                aria-label="Remove image"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-black/75 text-[14px] text-white hover:bg-black"
              >
                ×
              </button>
            </div>
          ))}
          {galleryPreviews.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="New gallery" className="h-20 w-28 object-cover opacity-80 ring-1 ring-white/40" />
          ))}
        </div>
        {newGallery.length > 0 && <p className="mt-2 text-[12px] text-muted">New images are uploaded when you save.</p>}
      </div>

      {notice && (
        <p role="alert" className="field-error md:col-span-2">
          {notice}
        </p>
      )}

      <div className="flex gap-4 md:col-span-2">
        <button type="submit" disabled={loading} className="btn btn-white">
          {loading ? "Saving..." : isEdit ? "Save changes" : "Create project"}
        </button>
        <button type="button" onClick={() => router.push("/admin/projects")} className="btn btn-gray">
          Cancel
        </button>
      </div>
    </form>
  );
}
