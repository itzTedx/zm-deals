import { S3Client } from "@aws-sdk/client-s3";
import { createUploadRouteHandler, type Router, route, UploadFileError } from "better-upload/server";
import crypto from "crypto";

import { getSession } from "@/lib/auth/server";
import { env } from "@/lib/env/server";
import { createLog } from "@/lib/logging";
import {
  CATEGORY_BANNER_FILE_MAX_SIZE,
  CATEGORY_BANNER_FILE_TYPES,
  CATEGORY_BANNER_UPLOAD_ROUTE,
  CATEGORY_FILE_MAX_SIZE,
  CATEGORY_FILE_TYPES,
  CATEGORY_UPLOAD_ROUTE,
  PRODUCT_FILE_MAX_FILES,
  PRODUCT_FILE_MAX_SIZE,
  PRODUCT_FILE_TYPES,
  PRODUCT_UPLOAD_ROUTE,
} from "@/modules/product/constants";

const log = createLog("Upload");

const s3 = new S3Client({
  region: env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ZMDEALS,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

log.info("S3 client initialized", {
  region: env.AWS_BUCKET_REGION,
  bucket: env.AWS_BUCKET_NAME,
});

const generateFileName = (bytes = 16) => crypto.randomBytes(bytes).toString("hex");

// Utility functions to extract repeating code
const authenticateUser = async () => {
  log.info("Starting upload process");

  const session = await getSession();
  if (!session) {
    log.warn("Upload attempt without authentication");
    throw new UploadFileError("Not logged in!");
  }

  log.auth("Upload authorized", session.user.id);
  log.data({ userId: session.user.id, email: session.user.email }, "User Session");

  return session;
};

const generateObjectKey = (file: { name: string; size: number; type: string }, uploadRoute: string) => {
  const filename = file.name.replace(/\.[^/.]+$/, "");
  const safeFileName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileExtension = file.name.split(".").pop() || "";
  const objectKey = `${uploadRoute}/${safeFileName}-${generateFileName()}.${fileExtension}`;

  log.file("Generated object key", objectKey);
  log.data(
    {
      originalName: file.name,
      safeName: safeFileName,
      objectKey,
      size: file.size,
      type: file.type,
      extension: fileExtension,
    },
    "File Info"
  );

  return objectKey;
};

const generatePublicUrl = (objectKey: string) => {
  return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_BUCKET_REGION}.amazonaws.com/${objectKey}`;
};

const router: Router = {
  client: s3,
  bucketName: env.AWS_BUCKET_NAME,
  routes: {
    [PRODUCT_UPLOAD_ROUTE]: route({
      fileTypes: PRODUCT_FILE_TYPES,
      multipleFiles: true,
      maxFiles: PRODUCT_FILE_MAX_FILES,
      maxFileSize: PRODUCT_FILE_MAX_SIZE,

      onBeforeUpload: async () => {
        try {
          await authenticateUser();
          return {
            generateObjectKey: ({ file }: { file: { name: string; size: number; type: string } }) =>
              generateObjectKey(file, PRODUCT_UPLOAD_ROUTE),
          };
        } catch (error) {
          log.error("Error in onBeforeUpload", error);
          throw error;
        }
      },

      onAfterSignedUrl: async ({ files }) => {
        try {
          log.info("Processing signed URLs", { fileCount: files.length });

          const urls = files.map((file) => {
            const url = generatePublicUrl(file.objectKey);
            log.file("Generated public URL", url);
            return url;
          });

          log.success("Successfully generated URLs for all files", { count: urls.length });

          return { metadata: { urls } };
        } catch (error) {
          log.error("Error in onAfterSignedUrl", error);
          throw error;
        }
      },
    }),
    [CATEGORY_UPLOAD_ROUTE]: route({
      fileTypes: CATEGORY_FILE_TYPES,
      multipleFiles: false,
      maxFileSize: CATEGORY_FILE_MAX_SIZE,

      onBeforeUpload: async ({ file }) => {
        try {
          await authenticateUser();
          const objectKey = generateObjectKey(file, CATEGORY_UPLOAD_ROUTE);
          return { objectKey };
        } catch (error) {
          log.error("Error in onBeforeUpload", error);
          throw error;
        }
      },

      onAfterSignedUrl: async ({ file }) => {
        try {
          log.info("Processing signed URLs", file.objectKey);

          const url = generatePublicUrl(file.objectKey);
          log.file("Generated public URL", url);

          return { metadata: { url } };
        } catch (error) {
          log.error("Error in onAfterSignedUrl", error);
          throw error;
        }
      },
    }),
    [CATEGORY_BANNER_UPLOAD_ROUTE]: route({
      fileTypes: CATEGORY_BANNER_FILE_TYPES,
      multipleFiles: true,
      maxFileSize: CATEGORY_BANNER_FILE_MAX_SIZE,

      onBeforeUpload: async () => {
        try {
          await authenticateUser();
          return {
            generateObjectKey: ({ file }: { file: { name: string; size: number; type: string } }) =>
              generateObjectKey(file, CATEGORY_BANNER_UPLOAD_ROUTE),
          };
        } catch (error) {
          log.error("Error in onBeforeUpload", error);
          throw error;
        }
      },

      onAfterSignedUrl: async ({ files }) => {
        try {
          log.info("Processing signed URLs", { fileCount: files.length });

          const urls = files.map((file) => {
            const url = generatePublicUrl(file.objectKey);
            log.file("Generated public URL", url);
            return url;
          });

          log.success("Successfully generated URLs for all files", { count: urls.length });

          return { metadata: { urls } };
        } catch (error) {
          log.error("Error in onAfterSignedUrl", error);
          throw error;
        }
      },
    }),
  },
};

export const { POST } = createUploadRouteHandler(router);
