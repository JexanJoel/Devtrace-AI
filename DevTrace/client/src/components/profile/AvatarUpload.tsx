// AvatarUpload — drag and drop or click to upload avatar image

import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';

interface Props {
  currentUrl: string | null;
  initials: string;
  onUpload: (file: File) => Promise<string | null>;
}

const AvatarUpload = ({ currentUrl, initials, onUpload }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl);

  const handleFile = async (file: File) => {
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Supabase
    setUploading(true);
    const url = await onUpload(file);
    if (url) setPreview(url);
    setUploading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex items-center gap-5">

      {/* Avatar preview */}
      <div
        className="relative w-20 h-20 rounded-2xl cursor-pointer group"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {preview ? (
          <img
            src={preview}
            alt="avatar"
            className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-200">
            {initials}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          {uploading
            ? <Loader2 size={18} className="text-white animate-spin" />
            : <Camera size={18} className="text-white" />
          }
        </div>
      </div>

      {/* Upload instructions */}
      <div>
        <button
          onClick={() => inputRef.current?.click()}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
        >
          {uploading ? 'Uploading...' : 'Change photo'}
        </button>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF · Max 2MB</p>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;