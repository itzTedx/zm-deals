import { S3Client } from "@aws-sdk/client-s3";
import { createUploadRouteHandler, type Router, route, UploadFileError } from "better-upload/server";
import crypto from "crypto";

import { getSession } from "@/lib/auth/server";
import { env } from "@/lib/env/server";
import {
  PRODUCT_FILE_MAX_FILES,
  PRODUCT_FILE_MAX_SIZE,
  PRODUCT_FILE_TYPES,
  PRODUCT_UPLOAD_ROUTE,
} from "@/modules/product/constants";

const s3 = new S3Client({
  region: env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
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
        const session = await getSession();
        if (!session) {
          throw new UploadFileError("Not logged in!");
        }
        return {
          generateObjectKey: ({ file }) => {
            const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            return `${PRODUCT_UPLOAD_ROUTE}/${safeFileName}-${generateFileName()}`;
          },
        };
      },
      onAfterSignedUrl: async ({ files }) => {
        // Set public URL for all files
        const urls = files.map(
          (file) => `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_BUCKET_REGION}.amazonaws.com/${file.objectKey}`
        );

        return {
          metadata: {
            urls,
          },
        };
      },
    }),
  },
};

export const { POST } = createUploadRouteHandler(router);
