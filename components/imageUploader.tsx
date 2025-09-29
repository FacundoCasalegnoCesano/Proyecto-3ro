/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Button } from "./ui/button";
import { ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";

interface CloudinaryUploadResultInfo {
  public_id: string;
  secure_url: string;
}

export default function ImageUploader({
  label,
  onUpload,
  maxImages,
  existingImage = null,
}: {
  label: string;
  onUpload: (result: { publicId: string; url: string }) => void;
  maxImages: number;
  existingImage?: string | null;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(existingImage);

  const handleDelete = () => {
    setImageUrl(null);
    onUpload({ publicId: "", url: "" });
  };

  const handleUploadSuccess = (results: CloudinaryUploadWidgetResults) => {
    const info =
      typeof results.info === "string"
        ? { public_id: "", secure_url: results.info }
        : (results.info as CloudinaryUploadResultInfo);

    if (info?.secure_url) {
      setImageUrl(info.secure_url);
      onUpload({
        publicId: info.public_id,
        url: info.secure_url,
      });
    }
  };

  return (
    <div className="border border-gray-300 rounded-md p-4 bg-white relative">
      <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded overflow-hidden">
        {imageUrl ? (
          <div className="relative w-full h-full group">
            <Image
              src={imageUrl}
              alt="Uploaded"
              className="w-full h-full object-contain rounded"
              width={300}
              height={300}
            />
            <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="bg-red-600/90 hover:bg-red-700/90 text-white"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Eliminar
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-2">
              Arrastra una imagen o haz clic para seleccionar
            </p>
            <CldUploadWidget
              uploadPreset="preset-1"
              options={{
                cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                maxFiles: maxImages,
              }}
              onSuccess={handleUploadSuccess}
            >
              {({ open }) => (
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400"
                  onClick={() => open()}
                >
                  {label}
                </Button>
              )}
            </CldUploadWidget>
          </div>
        )}
      </div>

      {imageUrl && (
        <div className="mt-3 flex justify-center">
          <CldUploadWidget
            uploadPreset="preset-1"
            options={{
              cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
              maxFiles: maxImages,
            }}
            onSuccess={handleUploadSuccess}
          >
            {({ open }) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400"
                onClick={() => open()}
              >
                <ImageIcon className="h-4 w-4 mr-2" /> Cambiar imagen
              </Button>
            )}
          </CldUploadWidget>
        </div>
      )}
    </div>
  );
}
