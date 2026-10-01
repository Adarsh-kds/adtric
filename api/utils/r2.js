const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const trimSlashes = (text) => (text || "").replace(/^\/+|\/+$/g, "");

const prefix = trimSlashes(process.env.R2_KEY_PREFIX);
const publicBaseUrl = trimSlashes(process.env.R2_PUBLIC_BASE_URL);

const uploadFile = async (buffer, fileName, contentType, folder) => {
  const key = `${prefix}/${folder}/${fileName}`;

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return `${publicBaseUrl}/${key}`;
};

const deleteFile = async (url) => {
  const start = `${publicBaseUrl}/${prefix}/`;
  if (!url || !url.startsWith(start)) {
    return;
  }

  const key = url.slice(publicBaseUrl.length + 1);
  await client.send(
    new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key })
  );
};

module.exports = { uploadFile, deleteFile };
