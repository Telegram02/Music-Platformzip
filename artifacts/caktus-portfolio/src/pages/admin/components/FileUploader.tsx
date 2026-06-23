import { useState, useRef } from "react";
import { uploadFile } from "@/lib/api";
import { Upload, Check, FolderOpen } from "lucide-react";
import { BucketFilePicker } from "./BucketFilePicker";

interface Props {
  accept: string;
  label: string;
  onUploaded: (objectPath: string) => void;
}

export function FileUploader({ accept, label, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setDone(false);
    try {
      const path = await uploadFile(file);
      onUploaded(path);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      alert("Upload failed: " + (err as Error).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleBucketSelect(objectPath: string) {
    onUploaded(objectPath);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-all ${
            done
              ? "border-green-500/50 bg-green-500/10 text-green-400"
              : uploading
              ? "border-purple-500/30 bg-purple-500/10 text-purple-300 cursor-wait"
              : "border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
          }`}
        >
          {done ? <Check size={15} className="text-green-400" /> : <Upload size={15} />}
          {uploading ? "Uploading..." : done ? "Uploaded!" : label}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleChange}
          />
        </button>

        <button
          type="button"
          onClick={() => setShowPicker(true)}
          disabled={uploading}
          title="Pick from bucket"
          className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
        >
          <FolderOpen size={15} />
          Bucket
        </button>
      </div>

      {showPicker && (
        <BucketFilePicker
          accept={accept}
          onSelect={handleBucketSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
