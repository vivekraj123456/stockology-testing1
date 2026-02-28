"use client";

import Image from "next/image";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import FormField from "@/components/admin/FormField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { BLOG_ASSIGNABLE_KEYWORDS } from "@/lib/blogs/keywords";

export type BlogFormState = {
  title: string;
  keywords: string[];
  image: string;
  excerpt: string;
  content: string;
  author: string;
};

export type BlogApiEntity = {
  id: string;
  title: string;
  slug: string;
  keywords: string[];
  content: string;
  excerpt: string;
  image: string;
  author: string;
  createdAt: string;
};

type BlogUploadFormProps = {
  mode?: "create" | "edit";
  blogId?: string;
  initialValues?: BlogFormState;
  onSuccess?: (blog: BlogApiEntity) => void;
  onCancel?: () => void;
};

type StatusState =
  | {
      type: "idle";
      message: "";
      slug?: undefined;
    }
  | {
      type: "success";
      message: string;
      slug?: string;
    }
  | {
      type: "error";
      message: string;
      slug?: undefined;
    };

const INITIAL_FORM_STATE: BlogFormState = {
  title: "",
  keywords: [],
  image: "",
  excerpt: "",
  content: "",
  author: "",
};

const MAX_IMAGE_FILE_SIZE_BYTES = 3 * 1024 * 1024;

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Unable to read image file."));
    };

    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong while publishing this blog.";
}

function mergeFormValues(initialValues?: BlogFormState): BlogFormState {
  if (!initialValues) {
    return INITIAL_FORM_STATE;
  }

  return {
    title: initialValues.title || "",
    keywords: Array.isArray(initialValues.keywords)
      ? initialValues.keywords.filter((value): value is string => typeof value === "string")
      : [],
    image: initialValues.image || "",
    excerpt: initialValues.excerpt || "",
    content: initialValues.content || "",
    author: initialValues.author || "",
  };
}

export default function BlogUploadForm({
  mode = "create",
  blogId,
  initialValues,
  onSuccess,
  onCancel,
}: BlogUploadFormProps) {
  const isEditMode = mode === "edit";

  const [form, setForm] = useState<BlogFormState>(() =>
    mergeFormValues(initialValues)
  );
  const [status, setStatus] = useState<StatusState>({
    type: "idle",
    message: "",
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    setForm(mergeFormValues(initialValues));
    setUploadedFileName("");
    setFileInputKey((prev) => prev + 1);
    setStatus({ type: "idle", message: "" });
  }, [initialValues]);

  const imagePreview = useMemo(() => {
    if (!form.image) {
      return "";
    }

    if (form.image.startsWith("http://") || form.image.startsWith("https://")) {
      return form.image;
    }

    if (form.image.startsWith("data:image/")) {
      return form.image;
    }

    return "";
  }, [form.image]);

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (status.type !== "idle") {
      setStatus({ type: "idle", message: "" });
    }
  };

  const handleContentChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      content: value,
    }));

    if (status.type !== "idle") {
      setStatus({ type: "idle", message: "" });
    }
  };

  const handleKeywordToggle = (keyword: string) => {
    setForm((prev) => {
      const hasKeyword = prev.keywords.includes(keyword);
      return {
        ...prev,
        keywords: hasKeyword
          ? prev.keywords.filter((item) => item !== keyword)
          : [...prev.keywords, keyword],
      };
    });

    if (status.type !== "idle") {
      setStatus({ type: "idle", message: "" });
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatus({
        type: "error",
        message: "Please upload a valid image file.",
      });
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
      setStatus({
        type: "error",
        message: "Image file must be 3MB or smaller.",
      });
      return;
    }

    try {
      const imageDataUrl = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, image: imageDataUrl }));
      setUploadedFileName(file.name);
      setStatus({ type: "idle", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message: getErrorMessage(error),
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isEditMode && !blogId) {
      setStatus({
        type: "error",
        message: "Missing blog id for edit operation.",
      });
      return;
    }

    setIsPublishing(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch(
        isEditMode ? `/api/blog/${blogId}` : "/api/blog",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        blog?: BlogApiEntity;
      };

      if (!response.ok || !payload.success || !payload.blog) {
        throw new Error(payload.error || "Failed to publish blog.");
      }

      setStatus({
        type: "success",
        message: isEditMode
          ? "Blog updated successfully."
          : "Blog published successfully.",
        slug: payload.blog.slug,
      });

      if (isEditMode) {
        setForm({
          title: payload.blog.title,
          keywords: payload.blog.keywords ?? [],
          image: payload.blog.image,
          excerpt: payload.blog.excerpt,
          content: payload.blog.content,
          author: payload.blog.author,
        });
      } else {
        setForm(INITIAL_FORM_STATE);
        setUploadedFileName("");
        setFileInputKey((prev) => prev + 1);
      }

      onSuccess?.(payload.blog);
    } catch (error) {
      setStatus({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/90 shadow-[0_16px_42px_rgba(15,23,42,0.08)] backdrop-blur"
    >
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 px-6 py-5 text-white sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
          {isEditMode ? "Update Existing Post" : "Create New Post"}
        </p>
        <h3 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
          {isEditMode ? "Edit Blog Content" : "Publish Blog Content"}
        </h3>
        <p className="mt-2 text-sm text-slate-200">
          Write the post details and publish directly to the public website.
        </p>
      </div>

      <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-7">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label="Blog Title"
            name="title"
            value={form.title}
            onChange={handleFieldChange}
            required
            placeholder="Example: How To Build A Swing Trading Checklist"
          />

          <FormField
            label="Author Name"
            name="author"
            value={form.author}
            onChange={handleFieldChange}
            required
            placeholder="Stockology Editorial Team"
          />
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Keywords / Category
          </p>
          <div className="flex flex-wrap gap-2">
            {BLOG_ASSIGNABLE_KEYWORDS.map((keyword) => {
              const isActive = form.keywords.includes(keyword);
              return (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => handleKeywordToggle(keyword)}
                  className={
                    isActive
                      ? "rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition"
                      : "rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                  }
                >
                  {keyword}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500">
            Selected: {form.keywords.length > 0 ? form.keywords.join(", ") : "None"}
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-emerald-50/40 p-5">
          <FormField
            label="Featured Image URL"
            name="image"
            value={form.image.startsWith("data:image/") ? "" : form.image}
            onChange={handleFieldChange}
            placeholder="https://example.com/featured-image.jpg"
          />

          <label className="flex flex-col gap-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
              Or Upload Featured Image
            </span>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-3">
              <input
                key={fileInputKey}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.08em] file:text-white hover:file:bg-emerald-700"
              />
            </div>
            {uploadedFileName ? (
              <p className="text-xs text-slate-500">Uploaded file: {uploadedFileName}</p>
            ) : (
              <p className="text-xs text-slate-500">Use JPG/PNG up to 3MB.</p>
            )}
          </label>
        </div>

        {imagePreview ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60">
            <div className="border-b border-slate-200 bg-white/70 px-4 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Image Preview
              </p>
            </div>
            <div className="relative h-64 w-full overflow-hidden">
              <Image
                src={imagePreview}
                alt="Featured preview"
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        <FormField
          label="Short Excerpt / Preview Text"
          name="excerpt"
          value={form.excerpt}
          onChange={handleFieldChange}
          required
          as="textarea"
          rows={4}
          placeholder="Write a short summary shown on the listing page..."
        />

        <RichTextEditor
          label="Full Blog Content"
          value={form.content}
          onChange={handleContentChange}
          required
          placeholder="Write complete blog content here..."
        />

        <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isPublishing}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:from-emerald-300 disabled:to-teal-300"
            >
              {isPublishing
                ? isEditMode
                  ? "Saving..."
                  : "Publishing..."
                : isEditMode
                  ? "Save Changes"
                  : "Publish"}
            </button>
            {isEditMode ? (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Cancel
              </button>
            ) : null}
          </div>

          {status.type === "success" ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              {status.message}
              {status.slug ? (
                <>
                  {" "}
                  <a
                    href={`/blog/${status.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2"
                  >
                    View Post
                  </a>
                </>
              ) : null}
            </p>
          ) : null}

          {status.type === "error" ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {status.message}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
