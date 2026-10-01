const serverUrl = process.env.API_URL;
const browserUrl = process.env.NEXT_PUBLIC_API_URL;

const getJson = async (path) => {
  const response = await fetch(`${serverUrl}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
  });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const getProjects = async (filters = {}) => {
  const query = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      query.set(key, filters[key]);
    }
  });
  return getJson(`/api/projects?${query.toString()}`);
};

export const getLocations = async () => {
  const result = await getJson("/api/projects/locations");
  return result.data;
};

export const getProjectOptions = async () => {
  const result = await getJson("/api/projects/options/list");
  return result.data;
};

export const getProjectBySlug = async (slug) => {
  const result = await getJson(`/api/projects/${encodeURIComponent(slug)}`);
  return result ? result.data : null;
};

export const postEnquiry = async (formData) => {
  const response = await fetch(`${browserUrl}/api/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  const body = await response.json();
  return { status: response.status, body };
};
