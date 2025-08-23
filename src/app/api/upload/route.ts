import { S3Client } from "@aws-sdk/client-s3";
import { createUploadRouteHandler, type Router, route, UploadFileError } from "better-upload/server";
import crypto from "crypto";

import { getSession } from "@/lib/auth/server";
import { env } from "@/lib/env/server";

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
    product: route({
      fileTypes: ["image/*"],
      multipleFiles: true,
      maxFiles: 10,
      maxFileSize: 1024 * 1024 * 5, // 5MB

      onBeforeUpload: async () => {
        const session = await getSession();
        if (!session) {
          throw new UploadFileError("Not logged in!");
        }

        return {
          generateObjectKey: ({ file }) => {
            const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

            return `products/${safeFileName}-${generateFileName()}`;
          },
        };
      },
    }),
  },
};

export const { POST } = createUploadRouteHandler(router);
