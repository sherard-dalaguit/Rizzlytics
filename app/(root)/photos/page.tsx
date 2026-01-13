'use client';

import React, {useEffect, useState} from 'react'
import {IMediaAssetDoc} from "@/database/media-asset.model";
import Image from 'next/image';
import {Button} from "@/components/ui/button";
import {IconX} from "@tabler/icons-react";

const PhotosPage = () => {
  const [mediaAssets, setMediaAssets] = useState<IMediaAssetDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('/api/assets', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Failed to fetch media assets');
        }

        const { mediaAssets } = await response.json();
        setMediaAssets(mediaAssets);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const handleDelete = async (assetId: string) => {
    try {
      const res = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        console.error('Failed to delete asset');
        return;
      }

      setMediaAssets(prev => prev.filter(asset => asset._id.toString() !== assetId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <p>Loading photos...</p>;
  }

  if (!mediaAssets.length) {
    return <p>No photos yet.</p>;
  }

  return (
    <section className="grid grid-cols-4 gap-4">
      {mediaAssets.map((asset: IMediaAssetDoc) => (
        <div key={asset._id.toString()} className="relative group">
          <Image
            src={asset.blobUrl}
            alt="user photo"
            width={200}
            height={200}
            className="rounded-xl"
          />

          <Button
            className="absolute top-2 left-2 h-8 w-8 rounded-full bg-black/60 text-white px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition"
            onClick={() => handleDelete(asset._id.toString())}
            type="button"
          >
            <IconX className="h-6 w-6" />
          </Button>
        </div>
      ))}
    </section>
  )
}
export default PhotosPage
