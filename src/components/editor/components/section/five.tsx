import * as React from "react";

import type { Editor } from "@tiptap/react";
import { toast } from "sonner";
import { VariantProps } from "tailwind-variants";

import { toggleVariants } from "@/components/ui/toggle";

import { IconBlockQuote, IconChevronUpDown, IconImage, IconPlus, IconSeparator } from "@/assets/icons";

import { useEditorImageUpload } from "../../hooks/use-editor-image-upload";
import type { FormatAction } from "../../types";
import { LinkEditPopover } from "../link/link-edit-popover";
import { ToolbarSection } from "../toolbar-section";

type InsertElementAction = "codeBlock" | "blockquote" | "horizontalRule" | "image";
interface InsertElement extends FormatAction {
  value: InsertElementAction;
}

interface SectionFiveProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  activeActions?: InsertElementAction[];
  mainActionCount?: number;
}

export const SectionFive: React.FC<SectionFiveProps> = ({
  editor,
  activeActions = ["image", "blockquote", "horizontalRule"],
  mainActionCount = 0,
  size,
  variant,
}) => {
  const { uploadImage, isPending } = useEditorImageUpload({
    onUploadComplete: (url: string) => {
      // Image uploaded successfully, insert it into the editor
      editor.chain().focus().setImage({ src: url }).run();
      toast.success("Image uploaded successfully!");
    },
    onUploadError: (error: { message: string }) => {
      console.error("Failed to upload image:", error.message);
      toast.error(`Failed to upload image: ${error.message}`);
    },
  });

  const createFormatActions = (): InsertElement[] => [
    {
      value: "image",
      label: isPending ? "Uploading..." : "Image",
      icon: isPending ? (
        <div className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <IconImage className="size-3.5" />
      ),
      action: () => {
        if (isPending) return; // Prevent multiple uploads

        // Create a file input element
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (event) => {
          const target = event.target as HTMLInputElement;
          const file = target.files?.[0];
          if (file) {
            try {
              await uploadImage(file);
            } catch (error) {
              console.error("Failed to upload image:", error);
              toast.error("Failed to upload image. Please try again.");
            }
          }
        };
        input.click();
      },
      isActive: () => false,
      canExecute: () => !isPending,
      shortcuts: ["mod", "shift", "I"],
    },
    {
      value: "blockquote",
      label: "Blockquote",
      icon: <IconBlockQuote className="size-3.5" />,
      action: (editor) => editor.chain().focus().toggleBlockquote().run(),
      isActive: (editor) => editor.isActive("blockquote"),
      canExecute: (editor) => editor.can().chain().focus().toggleBlockquote().run(),
      shortcuts: ["mod", "shift", "B"],
    },
    {
      value: "horizontalRule",
      label: "Divider",
      icon: <IconSeparator className="size-3.5" />,
      action: (editor) => editor.chain().focus().setHorizontalRule().run(),
      isActive: () => false,
      canExecute: (editor) => editor.can().chain().focus().setHorizontalRule().run(),
      shortcuts: ["mod", "alt", "-"],
    },
  ];

  const formatActions = createFormatActions();

  return (
    <>
      <LinkEditPopover editor={editor} size={size} variant={variant} />
      <ToolbarSection
        actions={formatActions}
        activeActions={activeActions}
        dropdownIcon={
          <>
            <IconPlus className="size-4" />
            <IconChevronUpDown className="ml-2 size-3 text-muted-foreground" />
          </>
        }
        dropdownTooltip="Insert elements"
        editor={editor}
        mainActionCount={mainActionCount}
        size={size}
        variant={variant}
      />
    </>
  );
};

SectionFive.displayName = "SectionFive";

export default SectionFive;
