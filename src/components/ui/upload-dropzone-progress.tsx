import { useEffect, useId, useRef } from "react";

import type { UploadHookControl } from "better-upload/client";
import { formatBytes } from "better-upload/client/helpers";
import { Dot, File, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { Progress } from "@/components/ui/progress";

import { cn } from "@/lib/utils";

type UploadDropzoneProgressProps = {
  control: UploadHookControl<true>;
  accept?: string;
  metadata?: Record<string, unknown>;
  description?:
    | {
        fileTypes?: string;
        maxFileSize?: string;
        maxFiles?: number;
      }
    | string;
  uploadOverride?: (...args: Parameters<UploadHookControl<true>["upload"]>) => void;

  // Add any additional props you need.
};

export function UploadDropzoneProgress({
  control: { upload, isPending, progresses },
  accept,
  metadata,
  description,
  uploadOverride,
}: UploadDropzoneProgressProps) {
  const id = useId();
  const previousProgresses = useRef<typeof progresses>([]);

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: (files) => {
      if (files.length > 0) {
        if (uploadOverride) {
          uploadOverride(files, { metadata });
        } else {
          upload(files, { metadata });
        }
      }
      inputRef.current.value = "";
    },
    noClick: true,
  });

  // Track progress changes and show toasts for completed uploads
  useEffect(() => {
    progresses.forEach((progress) => {
      const previousProgress = previousProgresses.current.find((p) => p.objectKey === progress.objectKey);

      // Check if upload just completed (progress was < 1 and now is 1, or status changed to completed)
      if (
        progress.progress === 1 &&
        progress.status !== "failed" &&
        (!previousProgress || previousProgress.progress < 1)
      ) {
        toast.success(`${progress.name} uploaded successfully!`, {
          duration: 3000,
        });
      }

      // Check if upload failed
      if (progress.status === "failed" && (!previousProgress || previousProgress.status !== "failed")) {
        toast.error(`Failed to upload ${progress.name}`, {
          duration: 3000,
        });
      }
    });

    previousProgresses.current = progresses;
  }, [progresses]);

  // Show progress toasts for active uploads
  useEffect(() => {
    progresses.forEach((progress) => {
      if (progress.progress < 1 && progress.status !== "failed") {
        toast.custom(
          (t) => (
            <div
              className={cn("flex w-fill items-center gap-2 rounded-lg border bg-card p-3", {
                "border-red-500/60 bg-red-500/[0.04]!": progress.status === "failed",
              })}
            >
              <FileIcon type={progress.type} />

              <div className="grid grow gap-1">
                <div className="flex items-center gap-0.5">
                  <p className="max-w-40 truncate font-medium text-sm">{progress.name}</p>
                  <Dot className="size-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-xs">{formatBytes(progress.size)}</p>
                </div>

                <div className="flex h-4 items-center">
                  {progress.progress < 1 && progress.status !== "failed" ? (
                    <Progress className="h-1.5" value={progress.progress * 100} />
                  ) : progress.status === "failed" ? (
                    <p className="text-red-500 text-xs">Failed</p>
                  ) : (
                    <p className="text-muted-foreground text-xs">Completed</p>
                  )}
                </div>
              </div>
            </div>
          ),
          {
            position: "bottom-right",
            id: progress.objectKey,
            duration: progress.progress < 1 ? Number.POSITIVE_INFINITY : 2000,
          }
        );
      } else if (progress.progress === 1 && progress.status !== "failed") {
        // Dismiss the progress toast when upload completes
        toast.dismiss(progress.objectKey);
      }
    });
  }, [progresses]);

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn("relative rounded-lg border border-dashed transition-colors", {
          "border-primary/70": isDragActive,
        })}
      >
        <label
          {...getRootProps()}
          className={cn(
            "flex w-full min-w-72 cursor-pointer flex-col items-center justify-center rounded-lg bg-transparent px-2 py-6 transition-colors dark:bg-input/10",
            {
              "cursor-not-allowed text-muted-foreground": isPending,
              "hover:bg-accent dark:hover:bg-accent/30": !isPending,
            }
          )}
          htmlFor={id}
        >
          <div className="my-2">
            <Upload className="size-6" />
          </div>

          <div className="mt-3 space-y-1 text-center">
            <p className="font-semibold text-sm">Drag and drop files here</p>

            <p className="max-w-64 text-muted-foreground text-xs">
              {typeof description === "string" ? (
                description
              ) : (
                <>
                  {description?.maxFiles &&
                    `You can upload ${description.maxFiles} file${description.maxFiles !== 1 ? "s" : ""}.`}{" "}
                  {description?.maxFileSize &&
                    `${description.maxFiles !== 1 ? "Each u" : "U"}p to ${description.maxFileSize}.`}{" "}
                  {description?.fileTypes && `Accepted ${description.fileTypes}.`}
                </>
              )}
            </p>
          </div>

          <input {...getInputProps()} accept={accept} disabled={isPending} id={id} multiple type="file" />
        </label>

        {isDragActive && (
          <div className="pointer-events-none absolute inset-0 rounded-lg bg-background">
            <div className="flex size-full flex-col items-center justify-center rounded-lg bg-accent dark:bg-accent/30">
              <div className="my-2">
                <Upload className="size-6" />
              </div>

              <p className="mt-3 font-semibold text-sm">Drop files here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const iconCaptions = {
  "image/": "IMG",
  "video/": "VID",
  "audio/": "AUD",
  "application/pdf": "PDF",
  "application/zip": "ZIP",
  "application/x-rar-compressed": "RAR",
  "application/x-7z-compressed": "7Z",
  "application/x-tar": "TAR",
  "application/json": "JSON",
  "application/javascript": "JS",
  "text/plain": "TXT",
  "text/csv": "CSV",
  "text/html": "HTML",
  "text/css": "CSS",
  "application/xml": "XML",
  "application/x-sh": "SH",
  "application/x-python-code": "PY",
  "application/x-executable": "EXE",
  "application/x-disk-image": "ISO",
};

function FileIcon({ type }: { type: string }) {
  const caption = Object.entries(iconCaptions).find(([key]) => type.startsWith(key))?.[1];

  return (
    <div className="relative shrink-0">
      <File className="size-12 text-muted-foreground" strokeWidth={1} />

      {caption && (
        <span className="absolute bottom-2.5 left-0.5 select-none rounded bg-primary px-1 py-px font-semibold text-primary-foreground text-xs">
          {caption}
        </span>
      )}
    </div>
  );
}
