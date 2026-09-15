"use client";

import {
  useState,
} from "react";

import {
  uploadImage,
} from "../lib/api";

import {
  getImageUrl,
} from "../lib/imageUrl";

import {
  getErrorMessage,
} from "../lib/getErrorMessage";

type ImageUploaderProps = {
  currentUrl?:
    | string
    | null;

  label?: string;
  showPreview?: boolean;

  onUploaded: (
    url: string
  ) => Promise<void> | void;
};

export default function ImageUploader({
  currentUrl,
  label = "上传图片",
  showPreview = true,
  onUploaded,
}: ImageUploaderProps) {
  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const imageUrl =
    getImageUrl(
      currentUrl
    );

  async function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target
        .files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const result =
        await uploadImage(
          file
        );

      await onUploaded(
        result.url
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err
        )
      );
    } finally {
      setUploading(
        false
      );

      event.target.value =
        "";
    }
  }

  return (
    <div>
      {showPreview && imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="mb-3 max-h-72 w-full rounded-2xl object-cover"
        />
      )}

      <label className="inline-flex cursor-pointer items-center rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
        {uploading
          ? "上传中..."
          : label}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={
            uploading
          }
          onChange={
            handleChange
          }
          className="hidden"
        />
      </label>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
