"use client";

import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  className?: string;
  itemClassName?: string;
};

function arrayMove<T>(arr: T[], from: number, to: number) {
  const copy = arr.slice();
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function fileKey(file: File) {
  // stable across reorders; different for distinct files
  return `${file.name}_${file.size}_${file.lastModified}`;
}

function useObjectUrls(files: File[]) {
  return React.useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
}

export default function ReorderableFileGrid({
  files,
  setFiles,
  className,
  itemClassName,
}: Props) {
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const urls = useObjectUrls(files);

  // track loaded per file
  const [loadedMap, setLoadedMap] = React.useState<Record<string, boolean>>({});

  // reset loadedMap when file set changes (new selection)
  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const f of files) next[fileKey(f)] = false;
    setLoadedMap(next);
  }, [files]);

  React.useEffect(() => {
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [urls]);

  if (!files.length) return null;

  return (
    <section className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", className)}>
      {files.map((file, idx) => {
        const url = urls[idx];
        const key = fileKey(file);
        const loaded = !!loadedMap[key];

        return (
          <div
            key={key}
            draggable
            onDragStart={() => setDragIndex(idx)}
            onDragEnd={() => setDragIndex(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex === null || dragIndex === idx) return;
              setFiles((prev) => arrayMove(prev, dragIndex, idx));
              setDragIndex(null);
            }}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]",
              "cursor-grab active:cursor-grabbing",
              dragIndex === idx ? "ring-2 ring-white/20" : "",
              itemClassName
            )}
            title="Drag to reorder"
          >
            <div className="absolute left-2 top-2 z-10 rounded-md px-2 py-1 text-xs text-white">
              {idx + 1}
            </div>

            <button
              type="button"
              onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
              className="absolute right-2 top-2 z-10 rounded-md px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              title="Remove"
            >
              ✕
            </button>

            <div className="relative aspect-square w-full bg-white/[0.03]">
              <Image
                src={url}
                alt=""
                fill
                className="object-contain"
                // key detail: mark THIS file as loaded
                onLoadingComplete={() =>
                  setLoadedMap((prev) => ({ ...prev, [key]: true }))
                }
              />

              {!loaded && <div className="absolute inset-0 animate-pulse bg-white/[0.04]" />}
            </div>

            <div className="border-t border-white/10 px-2 py-2">
              <p className="truncate text-xs text-zinc-300">{file.name}</p>
              <p className="text-[11px] text-zinc-500">Drag to reorder</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
