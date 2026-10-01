"use client";

import { useId, useState } from "react";
import { postEnquiry } from "@/lib/api";

const emptyForm = { name: "", mobile: "", email: "", project: "", message: "" };

const checkForm = (values) => {
  const errors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }
  if (!/^[6-9]\d{9}$/.test(values.mobile)) {
    errors.mobile = "Enter a valid 10-digit Indian mobile number";
  }
  if (values.email.trim() && !/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address";
  }
  if (!values.project) {
    errors.project = "Select a project";
  }
  if (values.message.length > 500) {
    errors.message = "Message must be at most 500 characters";
  }

  return errors;
};

export default function EnquiryForm({ projects, defaultProjectId = "" }) {
  const formId = useId();
  const [values, setValues] = useState({ ...emptyForm, project: defaultProjectId });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const newValue = name === "mobile" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setValues({ ...values, [name]: newValue });
    setErrors({ ...errors, [name]: undefined });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) {
      return;
    }

    const formErrors = checkForm(values);
    setNotice(null);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const { status, body } = await postEnquiry({
        name: values.name.trim(),
        mobile: values.mobile,
        email: values.email.trim(),
        project: values.project,
        message: values.message.trim(),
      });

      if (status === 201) {
        setValues({ ...emptyForm, project: defaultProjectId });
        setNotice({ type: "success", text: body.message });
      } else if (status === 400) {
        setErrors(body.errors || {});
        setNotice({ type: "error", text: "Please correct the highlighted fields." });
      } else if (status === 409) {
        setNotice({ type: "duplicate", text: body.message });
      } else {
        setNotice({ type: "error", text: body.message || "Something went wrong. Please try again." });
      }
    } catch (error) {
      setNotice({ type: "error", text: "Could not reach the server. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const noticeStyles = {
    success: "border-ok/60 text-ok",
    duplicate: "border-white/40 text-white",
    error: "border-error/60 text-error",
  };

  const fieldProps = (name) => ({
    id: `${formId}-${name}`,
    name,
    value: values[name],
    onChange: handleChange,
    className: "field-input",
    "aria-invalid": errors[name] ? "true" : "false",
    "aria-describedby": errors[name] ? `${formId}-${name}-error` : undefined,
  });

  const renderError = (name) =>
    errors[name] ? (
      <p id={`${formId}-${name}-error`} className="field-error">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div>
        <label htmlFor={`${formId}-name`} className="field-label">
          Your name
        </label>
        <input {...fieldProps("name")} type="text" autoComplete="name" />
        {renderError("name")}
      </div>

      <div>
        <label htmlFor={`${formId}-mobile`} className="field-label">
          Mobile
        </label>
        <input
          {...fieldProps("mobile")}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="10-digit number"
        />
        {renderError("mobile")}
      </div>

      <div>
        <label htmlFor={`${formId}-email`} className="field-label">
          Email (optional)
        </label>
        <input {...fieldProps("email")} type="email" autoComplete="email" />
        {renderError("email")}
      </div>

      <div>
        <label htmlFor={`${formId}-project`} className="field-label">
          Project
        </label>
        <select {...fieldProps("project")}>
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
        {renderError("project")}
      </div>

      <div>
        <label htmlFor={`${formId}-message`} className="field-label">
          Anything else (optional)
        </label>
        <textarea {...fieldProps("message")} rows={3} className="field-input resize-none" />
        {renderError("message")}
      </div>

      <div>
        <button type="submit" disabled={loading} className="btn btn-gray">
          {loading ? "Sending..." : "Send enquiry"}
        </button>
        <p className="mt-4 text-[13px] text-muted">
          Your details stay with our sales team and are never sold or shared.
        </p>
      </div>

      <div aria-live="polite">
        {notice && (
          <p className={`border px-4 py-3 text-[14px] ${noticeStyles[notice.type]}`}>
            {notice.text}
          </p>
        )}
      </div>
    </form>
  );
}
