'use client';

import type { PutBlobResult } from '@vercel/blob';
import { useState, useRef } from 'react';
import Image from 'next/image';
import {IMediaAsset} from "@/database/media-asset.model";

type UploadResponse = {
  blob: PutBlobResult;
  mediaAsset: IMediaAsset;
}

export default function PhotoUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  return (
    <>
      <h1>Upload Your Photo</h1>

      <form
        onSubmit={async (event) => {
          event.preventDefault();

          if (!inputFileRef.current?.files) {
            throw new Error("No file selected");
          }

          const file = inputFileRef.current.files[0];

          const response = await fetch(
            `/api/assets?filename=${file.name}&category=self_photo`,
            {
              method: 'POST',
              body: file,
            },
          );

          const data = (await response.json()) as UploadResponse;

          setBlob(data.blob);
        }}
      >
        <input name="file" ref={inputFileRef} type="file" accept="image/jpeg, image/png, image/webp" required />
        <button type="submit">Upload</button>
      </form>
      {blob && (
        <Image
          key={blob.pathname}
          src={blob.url}
          alt="uploaded photo"
          width={200}
          height={200}
        />
      )}
    </>
  );
}