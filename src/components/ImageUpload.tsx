'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus, Trash } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  return (
    <div className="space-y-4 w-full">
      {/* Превью загруженного изображения */}
      <div className="flex flex-wrap gap-4">
        {value && (
          <div className="relative w-64 h-64 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
            <button 
              type="button"
              onClick={onRemove} 
              className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-full z-10 hover:scale-110 transition shadow-lg"
            >
              <Trash className="w-4 h-4" />
            </button>
            <Image fill className="object-cover" alt="Product" src={value} />
          </div>
        )}
      </div>

      {/* Сам виджет загрузки */}
      <CldUploadWidget 
        onSuccess={(result: any) => onChange(result.info.secure_url)} 
        uploadPreset="nextstore_preset" // ПРОВЕРЬ: это имя должно совпадать с тем, что ты создала в Cloudinary
      >
        {({ open }) => {
          return (
            <button
              type="button"
              disabled={!!value}
              onClick={() => open()}
              className={`
                flex flex-col items-center justify-center gap-4 p-12 
                border-2 border-dashed rounded-[3rem] transition-all
                ${value 
                  ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed" 
                  : "border-gray-200 bg-gray-50 hover:bg-white hover:border-indigo-400 text-gray-400 hover:text-indigo-600"}
              `}
            >
              <ImagePlus className="w-10 h-10" />
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-widest">Add Product Image</p>
                <p className="text-[10px] font-medium opacity-60 mt-1">PNG, JPG or WebP up to 10MB</p>
              </div>
            </button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}