"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface Video {
  public_id: string;
  secure_url: string;
}

export default function VideoSelect({ 
  productId, 
  currentVideo, 
  allVideos = [] // Захист від undefined
}: { 
  productId: string, 
  currentVideo?: string | null,
  allVideos: Video[] 
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [selected, setSelected] = useState(currentVideo || "");

  const getVideoId = (url: string) => url ? url.split('/').pop()?.split('.')[0] : "";

  useEffect(() => {
    if (currentVideo && allVideos.length > 0) {
      const currentId = getVideoId(currentVideo);
      const match = allVideos.find(v => getVideoId(v.secure_url) === currentId);
      if (match) setSelected(match.secure_url);
    }
  }, [currentVideo, allVideos]);

  const handleSelect = async (videoUrl: string) => {
    setSelected(videoUrl);
    setIsSaving(true);
    try {
      const res = await fetch("/api/upload-video", {
        method: "POST",
        body: JSON.stringify({ productId, videoUrl }),
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error();
    } catch (e) {
      alert("Помилка збереження");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {/* ДІАГНОСТИКА: покаже скільки відео прийшло */}
      {allVideos.length === 0 && (
        <span className="text-[8px] text-red-500 flex items-center gap-1 font-bold">
          <AlertCircle className="w-2 h-2" /> 0 відео знайдено
        </span>
      )}

      <div className="flex items-center gap-2 relative z-50">
        <select 
          onChange={(e) => handleSelect(e.target.value)}
          value={selected}
          className="text-[10px] font-black uppercase bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 w-48 cursor-pointer shadow-sm"
          style={{ display: 'block', opacity: 1, visibility: 'visible' }}
        >
          <option value="">🚫 Без відео</option>
          {allVideos.map((v) => (
            <option key={v.public_id} value={v.secure_url}>
              {v.public_id.split('/').pop()?.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        
        {isSaving && <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />}
      </div>
    </div>
  );
}