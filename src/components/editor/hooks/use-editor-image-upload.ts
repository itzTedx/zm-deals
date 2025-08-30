import { useCallback, useState } from "react";

import { useUploadFile } from "better-upload/client";

import { EDITOR_UPLOAD_ROUTE } from "@/modules/product/constants";

interface UseEditorImageUploadOptions {
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: { message: string }) => void;
}

export function useEditorImageUpload({ onUploadComplete, onUploadError }: UseEditorImageUploadOptions = {}) {
  const [currentUploadPromise, setCurrentUploadPromise] = useState<{
    resolve: (value: string) => void;
    reject: (reason: Error) => void;
  } | null>(null);

  const { upload, isPending, progress } = useUploadFile({
    route: EDITOR_UPLOAD_ROUTE,
    onError: (error) => {
      onUploadError?.(error);
      if (currentUploadPromise) {
        currentUploadPromise.reject(new Error(error.message || "Upload failed"));
        setCurrentUploadPromise(null);
      }
    },
    onUploadComplete: async ({ file, metadata }) => {
      if (file && metadata && currentUploadPromise) {
        const url = (metadata as { url: string }).url;
        onUploadComplete?.(url);
        currentUploadPromise.resolve(url);
        setCurrentUploadPromise(null);
      }
    },
  });

  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        // Store the promise handlers
        setCurrentUploadPromise({ resolve, reject });

        // Start the upload
        upload(file);
      });
    },
    [upload]
  );

  return {
    uploadImage,
    isPending,
    progress,
  };
}
