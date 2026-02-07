"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Loader2, AlertCircle, Search, Check, ChevronsUpDown, X } from "lucide-react";

interface Video {
  public_id: string;
  secure_url: string;
}

export default function VideoSelect({ 
  productId, 
  currentVideo, 
  allVideos = [] 
}: { 
  productId: string, 
  currentVideo?: string | null,
  allVideos: Video[] 
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState(currentVideo || "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelected(currentVideo || "");
  }, [currentVideo]);

  const filteredVideos = useMemo(() => {
    const searchWords = searchTerm.toLowerCase().replace(/_/g, ' ').split(/\s+/).filter(w => w !== "");
    if (searchWords.length === 0) return allVideos;
    return allVideos.filter(v => {
      const videoName = v.public_id.toLowerCase().replace(/_/g, ' ');
      return searchWords.every(word => videoName.includes(word));
    });
  }, [searchTerm, allVideos]);

  const handleSelect = async (videoUrl: string) => {
    const targetUrl = videoUrl === "" ? null : videoUrl;
    setSelected(videoUrl);
    setIsOpen(false);
    setSearchTerm("");
    setIsSaving(true);
    try {
      const res = await fetch("/api/upload-video", {
        method: "POST",
        body: JSON.stringify({ productId, videoUrl: targetUrl }),
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error();
    } catch (e) {
      alert("Помилка збереження");
      setSelected(currentVideo || "");
    } finally {
      setIsSaving(false);
    }
  };

  const currentVideoName = useMemo(() => {
    if (!selected) return "🚫 Без відео";
    const video = allVideos.find(v => v.secure_url === selected);
    return video ? video.public_id.split('/').pop()?.replace(/_/g, ' ') : "Відео додано";
  }, [selected, allVideos]);

  return (
    <div className={`flex flex-col gap-1 ${isOpen ? "relative z-[9999]" : "relative z-0"}`} ref={containerRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSaving}
          className="flex items-center justify-between w-56 px-3 py-2 text-[10px] font-black uppercase bg-white border border-gray-200 rounded-xl hover:border-indigo-500 transition-all shadow-sm"
        >
          <span className="truncate mr-2 ">{currentVideoName}</span>
          {isSaving ? <Loader2 className="w-3 h-3 animate-spin text-indigo-600" /> : <ChevronsUpDown className="w-3 h-3 text-gray-400" />}
        </button>

        {isOpen && (
          /* ЗБІЛЬШЕНО: w-[600px] та додано тінь для кращого акценту */
          <div className="absolute right-0 mt-2 w-[600px] bg-white border border-gray-100 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in zoom-in duration-150 z-[10001]">
            
            {/* ПОШУК */}
            <div className="p-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Введіть ключові слова для пошуку відео..."
                className="w-full bg-transparent border-none outline-none text-xs font-black uppercase placeholder:text-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && <X className="w-4 h-4 text-gray-400 cursor-pointer hover:text-black" onClick={() => setSearchTerm("")} />}
            </div>

            {/* СПИСОК */}
            <div className="max-h-[500px] overflow-y-auto p-3 custom-scrollbar">
              <button
                type="button"
                onClick={() => handleSelect("")}
                className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 mb-2 border border-dashed border-rose-100 transition-colors"
              >
                🚫 Видалити відео з цього товару
              </button>

              <div className="grid grid-cols-1 gap-1">
                {filteredVideos.map((v) => (
                  <button
                    key={v.public_id}
                    type="button"
                    onClick={() => handleSelect(v.secure_url)}
                    className={`w-full text-left px-4 py-4 rounded-2xl flex items-center justify-between transition-all ${
                      selected === v.secure_url 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'hover:bg-indigo-50 text-black border border-transparent hover:border-indigo-100'
                    }`}
                  >
                    {/* ТЕКСТ ТЕПЕР НЕ ОБРІЗАЄТЬСЯ (whitespace-normal) */}
                    <span className="text-[11px] font-black uppercase leading-snug whitespace-normal break-words max-w-[500px]">
                      {v.public_id.split('/').pop()?.replace(/_/g, ' ')}
                    </span>
                    {selected === v.secure_url && <Check className="w-4 h-4 text-white shrink-0 ml-4" />}
                  </button>
                ))}
              </div>

              {filteredVideos.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center gap-2">
                  <Search className="w-8 h-8 text-gray-200" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Нічого не знайдено</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}