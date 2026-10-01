const imageHost = process.env.IMAGE_HOST;

const remotePatterns = [];
if (imageHost) {
  remotePatterns.push({ protocol: "https", hostname: imageHost });
}

if (process.env.NODE_ENV !== "production") {
  remotePatterns.push({ protocol: "http", hostname: "localhost" });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns,
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
