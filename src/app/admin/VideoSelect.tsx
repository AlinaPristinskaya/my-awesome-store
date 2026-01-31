"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Video {
  public_id: string;
  secure_url: string;
}

export default function VideoSelect({ 
  productId, 
  currentVideo, 
  allVideos 
}: { 
  productId: string, 
  currentVideo?: string | null,
  allVideos: Video[] 
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [selected, setSelected] = useState(currentVideo || "");

  const handleSelect = async (videoUrl: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/upload-video", {
        method: "POST",
        body: JSON.stringify({ productId, videoUrl }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) setSelected(videoUrl);
    } catch (e) {
      alert("Помилка збереження");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select 
        onChange={(e) => handleSelect(e.target.value)}
        value={selected}
        disabled={isSaving}
        className="text-[10px] font-black uppercase bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 outline-none focus:border-indigo-300 w-32 disabled:opacity-50"
      >
        <option value="">Без відео</option>
        {allVideos.map((v) => (
          <option key={v.public_id} value={v.secure_url}>
            {v.public_id.replace('shorts/', '')}
          </option>
        ))}
      </select>
      {isSaving && <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />}
    </div>
  );
}