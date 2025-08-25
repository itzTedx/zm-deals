import { S3Client } from "@aws-sdk/client-s3";
import { createUploadRouteHandler, type Router, route, UploadFileError } from "better-upload/server";
import crypto from "crypto";

import { getSession } from "@/lib/auth/server";
import { env } from "@/lib/env/server";
import { createLog } from "@/lib/logging";
import {
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
        log.info("Starting upload process");

        try {
          const session = await getSession();
          if (!session) {
            log.warn("Upload attempt without authentication");
            throw new UploadFileError("Not logged in!");
          }

          log.auth("Upload authorized", session.user.id);
          log.data({ userId: session.user.id, email: session.user.email }, "User Session");

          return {
            generateObjectKey: ({ file }) => {
              const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
              const objectKey = `${PRODUCT_UPLOAD_ROUTE}/${safeFileName}-${generateFileName()}`;

              log.file("Generated object key", objectKey);
              log.data(
                {
                  originalName: file.name,
                  safeName: safeFileName,
                  objectKey,
                  size: file.size,
                  type: file.type,
                },
                "File Info"
              );

              return objectKey;
            },
          };
        } catch (error) {
          log.error("Error in onBeforeUpload", error);
          throw error;
        }
      },

      onAfterSignedUrl: async ({ files }) => {
        log.info("Processing signed URLs", { fileCount: files.length });

        try {
          // Set public URL for all files
          const urls = files.map((file) => {
            const url = `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_BUCKET_REGION}.amazonaws.com/${file.objectKey}`;
            log.file("Generated public URL", url);
            return url;
          });

          log.success("Successfully generated URLs for all files", { count: urls.length });
          log.data({ urls }, "Generated URLs");

          return {
            metadata: {
              urls,
            },
          };
        } catch (error) {
          log.error("Error in onAfterSignedUrl", error);
          throw error;
        }
      },
    }),
  },
};

log.info("Upload router configured", {
  route: PRODUCT_UPLOAD_ROUTE,
  maxFiles: PRODUCT_FILE_MAX_FILES,
  maxFileSize: PRODUCT_FILE_MAX_SIZE,
  fileTypes: PRODUCT_FILE_TYPES,
});

const { POST: originalPOST } = createUploadRouteHandler(router);

// Wrap the POST handler with error logging
export const POST = async (request: Request) => {
  const startTime = Date.now();

  try {
    log.http("POST", "/api/upload", undefined);
    log.info("Upload request received");

    const response = await originalPOST(request);

    const duration = Date.now() - startTime;
    log.perf("Upload request", duration);
    log.success("Upload request completed successfully");

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    log.perf("Upload request (failed)", duration);
    log.error("Upload request failed", error);

    // Re-throw the error to maintain the original error handling
    throw error;
  }
};
